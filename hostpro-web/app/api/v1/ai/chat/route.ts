import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";
import { db } from "@/lib/db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es l'Assistant IA de HOST PRO, une plateforme professionnelle de gestion locative saisonnière.
Tu aides les hôtes avec :
- La gestion de leurs propriétés (Airbnb, Booking.com, location directe)
- L'optimisation des prix et du taux d'occupation
- La conformité réglementaire (loi Le Meur, DPE, nuitées)
- La rédaction de messages pour les voyageurs
- L'analyse des performances et revenus
- Les tâches de maintenance et ménage

Réponds en français, de façon concise et professionnelle.
Si tu as des données contextuelles sur les propriétés ou réservations de l'utilisateur, utilise-les pour personnaliser ta réponse.`;

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { messages, context } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Messages requis" }, { status: 400 });
  }

  // Récupérer le contexte des propriétés pour enrichir l'IA
  let contextualInfo = "";
  try {
    const [properties, reservations] = await Promise.all([
      db.property.findMany({
        where: { tenant_id: tenantId },
        select: { name: true, city: true, status: true, base_price_night: true },
        take: 10,
      }),
      db.reservation.findMany({
        where: { tenant_id: tenantId, status: { in: ["confirmed", "pending"] } },
        include: { property: { select: { name: true } } },
        take: 5,
        orderBy: { check_in: "asc" },
      }),
    ]);

    if (properties.length > 0) {
      contextualInfo = `\n\nContexte utilisateur :
Propriétés : ${properties.map((p) => `${p.name} (${p.city}, ${p.status}, ${p.base_price_night}€/nuit)`).join(", ")}
Prochaines réservations : ${reservations.slice(0, 3).map((r) => `${r.property.name} - ${r.guest_name} du ${r.check_in} au ${r.check_out}`).join(" | ")}`;
    }
    if (context) contextualInfo += `\n${context}`;
  } catch {
    // Continuer sans contexte si la DB est indisponible
  }

  // Appel Claude avec streaming
  const stream = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT + contextualInfo,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    stream: true,
  });

  // Stream SSE vers le client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

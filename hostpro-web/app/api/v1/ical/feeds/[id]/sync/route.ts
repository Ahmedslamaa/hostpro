export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

// ── Minimal iCal parser (no external deps, no BigInt issues) ─────────────────
interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string | null;
  dtend: string | null;
}

function parseICS(icsText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icsText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // unfold wrapped lines (RFC 5545 §3.1)
    .replace(/\n[ \t]/g, "")
    .split("\n");

  let current: Partial<ICalEvent> | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") {
      current = { uid: "", summary: "", dtstart: null, dtend: null };
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current as ICalEvent);
      current = null;
      continue;
    }
    if (!current) continue;

    // Split on first colon — property name may include params (e.g. DTSTART;VALUE=DATE)
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = line.slice(0, colonIdx).toUpperCase();
    const val  = line.slice(colonIdx + 1).trim();

    if (prop === "UID")               current.uid     = val;
    else if (prop === "SUMMARY")      current.summary = val;
    else if (prop.startsWith("DTSTART")) current.dtstart = parseICalDate(val);
    else if (prop.startsWith("DTEND"))   current.dtend   = parseICalDate(val);
  }

  return events;
}

/** Convert iCal date/datetime string → ISO 8601 date string (YYYY-MM-DD) */
function parseICalDate(val: string): string | null {
  if (!val) return null;
  // DATE only: 20240601
  if (/^\d{8}$/.test(val)) {
    return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
  }
  // DATETIME: 20240601T140000Z or 20240601T140000
  if (/^\d{8}T\d{6}/.test(val)) {
    const d = val.slice(0, 8);
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const feed = await db.icalFeed.findUnique({
      where: { id: params.id },
      include: { property: { select: { tenant_id: true, name: true } } },
    });

    if (!feed) return NextResponse.json({ error: "Feed introuvable" }, { status: 404 });
    if (feed.property.tenant_id !== auth.tenant_id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const response = await fetch(feed.url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "HostPro/1.0 iCal-Sync" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} en récupérant le calendrier`);

    const icsText = await response.text();
    const events  = parseICS(icsText);

    let imported = 0;
    let skipped  = 0;

    for (const event of events) {
      if (!event.dtstart || !event.dtend) continue;

      const checkIn  = event.dtstart;
      const checkOut = event.dtend;

      const start  = new Date(checkIn);
      const end    = new Date(checkOut);
      const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
      if (nights <= 0) continue;

      const externalId = event.uid || `${feed.id}-${checkIn}`;
      const rawSummary = event.summary || `Réservation ${feed.platform}`;
      const guestName  = rawSummary.replace(/\b(BLOCKED|Airbnb \(Not available\))\b/gi, "Indisponible");

      const existing = await db.reservation.findFirst({
        where: { property_id: feed.property_id, external_id: externalId },
      });

      if (existing) { skipped++; continue; }

      await db.reservation.create({
        data: {
          tenant_id:   feed.property.tenant_id,
          property_id: feed.property_id,
          guest_name:  guestName,
          check_in:    checkIn,
          check_out:   checkOut,
          nights,
          source:      feed.platform,
          status:      "confirmed",
          external_id: externalId,
          reference:   `EXT-${externalId.slice(0, 8).toUpperCase()}`,
        },
      });
      imported++;
    }

    await db.icalFeed.update({
      where: { id: feed.id },
      data: { last_sync: new Date() },
    });

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: imported + skipped,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[iCal sync]", msg);
    return NextResponse.json({ error: `Erreur sync : ${msg}` }, { status: 500 });
  }
}

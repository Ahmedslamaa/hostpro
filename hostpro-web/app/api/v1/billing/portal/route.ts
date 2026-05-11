import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req, { minRole: "admin" });
  if (guard instanceof NextResponse) return guard;
  const { tenantId } = guard;

  try {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé. Souscrivez d'abord à un plan." },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[billing/portal]", e);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}

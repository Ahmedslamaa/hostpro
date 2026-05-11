import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { stripe, PRICE_IDS, PlanTier } from "@/lib/stripe";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req, { minRole: "admin" });
  if (guard instanceof NextResponse) return guard;
  const { auth, tenantId } = guard;

  try {
    const { plan } = await req.json();

    if (!plan || !(plan in PRICE_IDS)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan as PlanTier];
    if (!priceId) {
      return NextResponse.json(
        { error: "Ce plan n'est pas encore configuré. Contactez le support." },
        { status: 503 }
      );
    }

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return NextResponse.json({ error: "Tenant introuvable" }, { status: 404 });

    // Create or reuse Stripe customer
    let customerId = tenant.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.email,
        name: tenant.name,
        metadata: { tenant_id: tenantId },
      });
      customerId = customer.id;
      await db.tenant.update({
        where: { id: tenantId },
        data: { stripe_customer_id: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/settings/billing?success=1`,
      cancel_url: `${APP_URL}/settings/billing?canceled=1`,
      allow_promotion_codes: true,
      metadata: { tenant_id: tenantId, plan },
      subscription_data: { metadata: { tenant_id: tenantId } },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[billing/checkout]", e);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}

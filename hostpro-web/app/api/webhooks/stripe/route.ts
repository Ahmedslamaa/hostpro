import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (e) {
    console.error("[stripe/webhook] Signature verification failed:", e);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id;
        const plan = session.metadata?.plan;
        if (tenantId && plan && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const periodEnd = (sub as unknown as Record<string, number>).current_period_end;
          await db.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              stripe_subscription_id: sub.id,
              stripe_price_id: sub.items.data[0]?.price.id,
              stripe_status: sub.status,
              stripe_current_period_end: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription & { current_period_end?: number };
        const tenantId = sub.metadata?.tenant_id;
        if (tenantId) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          await db.tenant.update({
            where: { id: tenantId },
            data: {
              stripe_status: sub.status,
              stripe_price_id: sub.items.data[0]?.price.id,
              stripe_current_period_end: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
              plan: isActive ? undefined : "starter",
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription_details?: { metadata?: Record<string, string> };
        };
        const tenantId = invoice.subscription_details?.metadata?.tenant_id;
        if (tenantId) {
          await db.tenant.update({
            where: { id: tenantId },
            data: { stripe_status: "past_due" },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error(`[stripe/webhook] Error processing ${event.type}:`, e);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

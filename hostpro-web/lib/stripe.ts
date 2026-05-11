import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is required in production");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

// Price IDs — set in env, one per plan tier
export const PRICE_IDS = {
  starter:    process.env.STRIPE_PRICE_STARTER    ?? "",
  pro:        process.env.STRIPE_PRICE_PRO        ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
} as const;

export type PlanTier = keyof typeof PRICE_IDS;

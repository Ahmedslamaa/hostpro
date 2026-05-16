import Stripe from "stripe";

// Create Stripe instance with test key if secret key is not available (for build time)
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

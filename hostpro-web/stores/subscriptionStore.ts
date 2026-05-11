"use client";
import { create } from "zustand";
import { hasFeature, getLimit, PlanFeatures } from "@/lib/plans";

export interface SubscriptionState {
  plan: string;
  status: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  features: Partial<PlanFeatures>;
  properties_limit: number;
  team_members_limit: number;
  ical_feeds_limit: number;

  // Actions
  setSubscription: (data: Partial<SubscriptionState>) => void;
  reset: () => void;

  // Helpers réactifs
  can: (feature: keyof PlanFeatures) => boolean;
  limit: (key: "properties_limit" | "team_members_limit" | "ical_feeds_limit") => number;
  isTrialing: () => boolean;
  isActive: () => boolean;
}

const DEFAULT: Omit<SubscriptionState, "setSubscription" | "reset" | "can" | "limit" | "isTrialing" | "isActive"> = {
  plan: "enterprise",
  status: "active",
  trial_end: null,
  current_period_end: "2027-12-31",
  features: {
    properties_limit:    -1,
    team_members_limit:  -1,
    ical_feeds_limit:    -1,
    reservations_export: true,
    channel_manager:     true,
    ai_pricing:          true,
    ai_assistant:        true,
    advanced_analytics:  true,
    accounting:          true,
    automation:          true,
    api_access:          true,
    white_label:         true,
    priority_support:    true,
    multi_currency:      true,
  },
  properties_limit: -1,
  team_members_limit: -1,
  ical_feeds_limit: -1,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  ...DEFAULT,

  setSubscription: (data) => set((s) => ({ ...s, ...data })),

  reset: () => set(DEFAULT),

  /** Vérifie si la feature est accessible dans le plan actif */
  can: (feature) => {
    const { features, plan } = get();
    // Priorité : features remontées par l'API, sinon dérivé du plan local
    if (feature in features) return Boolean(features[feature as keyof PlanFeatures]);
    return hasFeature(plan, feature);
  },

  /** Retourne la limite numérique du plan actif */
  limit: (key) => {
    const s = get();
    if (key === "properties_limit")   return s.properties_limit;
    if (key === "team_members_limit") return s.team_members_limit;
    if (key === "ical_feeds_limit")   return s.ical_feeds_limit;
    return getLimit(s.plan, key);
  },

  isTrialing: () => get().status === "trialing",
  isActive:   () => ["active", "trialing"].includes(get().status ?? ""),
}));

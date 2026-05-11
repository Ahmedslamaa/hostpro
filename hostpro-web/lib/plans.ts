// ── Miroir exact de app/core/plans.py ─────────────────────────────────────
// Source de vérité côté frontend pour l'affichage et le pré-contrôle UI.

export type PlanId = "trial" | "starter" | "pro" | "enterprise";

export interface PlanFeatures {
  // Limites
  properties_limit: number;       // -1 = illimité
  team_members_limit: number;
  ical_feeds_limit: number;
  reservations_export: boolean;
  // Fonctionnalités
  channel_manager: boolean;
  ai_pricing: boolean;
  ai_assistant: boolean;
  advanced_analytics: boolean;
  accounting: boolean;
  automation: boolean;
  api_access: boolean;
  white_label: boolean;
  priority_support: boolean;
  multi_currency: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number;          // €/mois
  description: string;
  highlight?: boolean;    // plan mis en avant
  features: PlanFeatures;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  trial: {
    id: "trial",
    name: "Essai gratuit",
    price: 0,
    description: "14 jours pour explorer HOST PRO",
    features: {
      properties_limit:    2,
      team_members_limit:  2,
      ical_feeds_limit:    1,
      reservations_export: false,
      channel_manager:     true,
      ai_pricing:          false,
      ai_assistant:        false,
      advanced_analytics:  false,
      accounting:          false,
      automation:          false,
      api_access:          false,
      white_label:         false,
      priority_support:    false,
      multi_currency:      false,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 49,
    description: "Pour les gestionnaires indépendants",
    features: {
      properties_limit:    5,
      team_members_limit:  3,
      ical_feeds_limit:    2,
      reservations_export: true,
      channel_manager:     true,
      ai_pricing:          false,
      ai_assistant:        false,
      advanced_analytics:  false,
      accounting:          false,
      automation:          true,
      api_access:          false,
      white_label:         false,
      priority_support:    false,
      multi_currency:      false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    description: "Pour les agences en croissance",
    highlight: true,
    features: {
      properties_limit:    20,
      team_members_limit:  10,
      ical_feeds_limit:    5,
      reservations_export: true,
      channel_manager:     true,
      ai_pricing:          true,
      ai_assistant:        true,
      advanced_analytics:  true,
      accounting:          true,
      automation:          true,
      api_access:          false,
      white_label:         false,
      priority_support:    false,
      multi_currency:      true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 179,
    description: "Pour les grandes structures",
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
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

export function getPlan(id: string): PlanDefinition {
  return PLANS[id as PlanId] ?? PLANS.trial;
}

export function hasFeature(plan: string, feature: keyof PlanFeatures): boolean {
  const def = getPlan(plan);
  const val = def.features[feature];
  return typeof val === "boolean" ? val : false;
}

export function getLimit(plan: string, key: "properties_limit" | "team_members_limit" | "ical_feeds_limit"): number {
  return getPlan(plan).features[key];
}

export function formatLimit(limit: number): string {
  return limit === -1 ? "Illimité" : String(limit);
}

/** Retourne le plan suivant (pour l'affichage "passer à Pro") */
export function nextPlan(current: string): PlanDefinition | null {
  const order: PlanId[] = ["trial", "starter", "pro", "enterprise"];
  const idx = order.indexOf(current as PlanId);
  if (idx === -1 || idx >= order.length - 1) return null;
  return PLANS[order[idx + 1]];
}

/** Liste des fonctionnalités bloquées pour un plan donné */
export function lockedFeatures(plan: string): (keyof PlanFeatures)[] {
  const features = getPlan(plan).features;
  return (Object.keys(features) as (keyof PlanFeatures)[]).filter(k => {
    const v = features[k];
    return typeof v === "boolean" && !v;
  });
}

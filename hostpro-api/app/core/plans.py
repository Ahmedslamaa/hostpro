"""
HOST PRO — Définition des plans d'abonnement et leurs limites.
Source de vérité unique : utilisée par les dépendances FastAPI ET exposée via l'API.
"""
from typing import TypedDict


class PlanFeatures(TypedDict):
    # ── Limites quantitatives ───────────────────────────────────────────────
    properties_limit: int          # -1 = illimité
    team_members_limit: int        # -1 = illimité
    ical_feeds_limit: int          # par propriété ; -1 = illimité
    reservations_export: bool      # export CSV/Excel des réservations
    # ── Fonctionnalités ─────────────────────────────────────────────────────
    channel_manager: bool          # matrice dispo + rate manager
    ai_pricing: bool               # tarification dynamique IA
    ai_assistant: bool             # assistant IA (Sparkles)
    advanced_analytics: bool       # analytics & rapports avancés
    accounting: bool               # module comptabilité
    automation: bool               # règles d'automatisation
    api_access: bool               # accès API REST directe
    white_label: bool              # suppression branding HOST PRO
    priority_support: bool         # SLA support 4h
    multi_currency: bool           # tarifs multi-devises


PLANS: dict[str, PlanFeatures] = {
    # ── Essai 14 jours ───────────────────────────────────────────────────────
    "trial": {
        "properties_limit":    2,
        "team_members_limit":  2,
        "ical_feeds_limit":    1,
        "reservations_export": False,
        "channel_manager":     True,
        "ai_pricing":          False,
        "ai_assistant":        False,
        "advanced_analytics":  False,
        "accounting":          False,
        "automation":          False,
        "api_access":          False,
        "white_label":         False,
        "priority_support":    False,
        "multi_currency":      False,
    },
    # ── Starter — 49 €/mois ─────────────────────────────────────────────────
    "starter": {
        "properties_limit":    5,
        "team_members_limit":  3,
        "ical_feeds_limit":    2,
        "reservations_export": True,
        "channel_manager":     True,
        "ai_pricing":          False,
        "ai_assistant":        False,
        "advanced_analytics":  False,
        "accounting":          False,
        "automation":          True,
        "api_access":          False,
        "white_label":         False,
        "priority_support":    False,
        "multi_currency":      False,
    },
    # ── Pro — 99 €/mois ─────────────────────────────────────────────────────
    "pro": {
        "properties_limit":    20,
        "team_members_limit":  10,
        "ical_feeds_limit":    5,
        "reservations_export": True,
        "channel_manager":     True,
        "ai_pricing":          True,
        "ai_assistant":        True,
        "advanced_analytics":  True,
        "accounting":          True,
        "automation":          True,
        "api_access":          False,
        "white_label":         False,
        "priority_support":    False,
        "multi_currency":      True,
    },
    # ── Enterprise — 179 €/mois ─────────────────────────────────────────────
    "enterprise": {
        "properties_limit":    -1,
        "team_members_limit":  -1,
        "ical_feeds_limit":    -1,
        "reservations_export": True,
        "channel_manager":     True,
        "ai_pricing":          True,
        "ai_assistant":        True,
        "advanced_analytics":  True,
        "accounting":          True,
        "automation":          True,
        "api_access":          True,
        "white_label":         True,
        "priority_support":    True,
        "multi_currency":      True,
    },
}

# Plans considérés comme actifs (abonnement payant ou essai en cours)
ACTIVE_STATUSES = {"trialing", "active"}

# Hiérarchie des plans (pour comparaisons >=)
PLAN_RANK = {"trial": 0, "starter": 1, "pro": 2, "enterprise": 3}


def get_plan_features(plan: str) -> PlanFeatures:
    """Retourne les features d'un plan (fallback sur trial si plan inconnu)."""
    return PLANS.get(plan, PLANS["trial"])


def plan_has_feature(plan: str, feature: str) -> bool:
    """Vérifie si un plan a accès à une feature booléenne."""
    features = get_plan_features(plan)
    return bool(features.get(feature, False))


def plan_get_limit(plan: str, limit_key: str) -> int:
    """Retourne la limite numérique d'un plan (-1 = illimité)."""
    features = get_plan_features(plan)
    return int(features.get(limit_key, 0))


def is_within_limit(plan: str, limit_key: str, current_count: int) -> bool:
    """Vérifie si current_count est sous la limite du plan."""
    limit = plan_get_limit(plan, limit_key)
    if limit == -1:
        return True
    return current_count < limit

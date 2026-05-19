"use client";
import { useState } from "react";
import { Check, Zap, Lock, Star, Building2, Crown, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { PLANS, PlanId, formatLimit } from "@/lib/plans";
import { cn } from "@/lib/utils";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const ROSE_DEEP = "#C00040";
const PAPER = "#F4F2F0";

// Icônes par plan
const PLAN_ICONS: Record<PlanId, LucideIcon> = {
  trial:      Zap,
  starter:    Star,
  pro:        Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<PlanId, { bg: string; iconBg: string; iconColor: string; border: string }> = {
  trial:      { bg: PAPER,                      iconBg: "rgba(26,14,18,0.08)",   iconColor: INK_SOFT,  border: "rgba(0,0,0,0.08)" },
  starter:    { bg: "rgba(59,130,246,0.05)",    iconBg: "rgba(59,130,246,0.12)", iconColor: "#1d4ed8", border: "rgba(59,130,246,0.2)" },
  pro:        { bg: "rgba(224,32,96,0.04)",     iconBg: "rgba(224,32,96,0.12)", iconColor: ROSE,      border: "rgba(224,32,96,0.25)" },
  enterprise: { bg: "rgba(26,14,18,0.04)",      iconBg: INK,                    iconColor: "#F4F2F0", border: "rgba(26,14,18,0.2)" },
};

const FEATURES_TABLE = [
  { key: "properties_limit",    label: "Propriétés",          isLimit: true  },
  { key: "team_members_limit",  label: "Membres d'équipe",    isLimit: true  },
  { key: "ical_feeds_limit",    label: "Connexions iCal/propriété", isLimit: true },
  { key: "channel_manager",     label: "Channel Manager",     isLimit: false },
  { key: "automation",          label: "Automatisation",      isLimit: false },
  { key: "reservations_export", label: "Export réservations", isLimit: false },
  { key: "ai_pricing",          label: "Tarification IA",     isLimit: false },
  { key: "ai_assistant",        label: "Assistant IA",        isLimit: false },
  { key: "advanced_analytics",  label: "Analytics avancées",  isLimit: false },
  { key: "accounting",          label: "Comptabilité",        isLimit: false },
  { key: "multi_currency",      label: "Multi-devises",       isLimit: false },
  { key: "api_access",          label: "Accès API",           isLimit: false },
  { key: "white_label",         label: "White Label",         isLimit: false },
  { key: "priority_support",    label: "Support prioritaire", isLimit: false },
];

export default function BillingPage() {
  const { plan, status, trial_end, current_period_end, features, properties_limit, team_members_limit } = useSubscriptionStore();
  const [annual, setAnnual] = useState(false);

  const planOrder: PlanId[] = ["starter", "pro", "enterprise"];
  const discount = 0.17; // 17% de réduction annuelle

  const getPrice = (base: number) => annual ? Math.round(base * (1 - discount)) : base;

  const monoLabel: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em", textTransform: "uppercase",
  };

  const currentColors = PLAN_COLORS[plan as PlanId] ?? PLAN_COLORS.trial;

  return (
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Abonnement</h1>
        <p style={{ color: INK_SOFT, fontSize: 13, marginTop: 4 }}>Gérez votre plan et vos fonctionnalités</p>
      </div>

      {/* Plan actuel */}
      <div style={{
        borderRadius: 18, border: `1px solid ${currentColors.border}`,
        background: currentColors.bg, padding: 20, marginBottom: 32,
      }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: currentColors.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {(() => { const Icon: LucideIcon = PLAN_ICONS[plan as PlanId] ?? Zap; return <Icon size={22} style={{ color: currentColors.iconColor }} />; })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  Plan {PLANS[plan as PlanId]?.name ?? plan}
                </h2>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "4px 8px", borderRadius: 99,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  ...(status === "trialing"
                    ? { background: "rgba(192,160,96,0.15)", color: "#C0A060" }
                    : { background: "rgba(27,122,74,0.1)", color: "#1B7A4A" }),
                }}>
                  {status === "trialing" ? "Essai" : status === "active" ? "Actif" : status ?? "Inconnu"}
                </span>
              </div>
              <p style={{ color: INK_SOFT, fontSize: 13, marginTop: 2 }}>
                {status === "trialing" && trial_end
                  ? `Essai jusqu'au ${new Date(trial_end).toLocaleDateString("fr-FR")}`
                  : current_period_end
                  ? `Renouvellement le ${new Date(current_period_end).toLocaleDateString("fr-FR")}`
                  : PLANS[plan as PlanId]?.description ?? ""}
              </p>
            </div>
          </div>

          {/* Utilisation */}
          <div className="flex gap-6">
            <UsageBar
              label="Propriétés"
              current={0}
              limit={properties_limit}
            />
            <UsageBar
              label="Membres"
              current={0}
              limit={team_members_limit}
            />
          </div>
        </div>
      </div>

      {/* Toggle annuel/mensuel */}
      <div className="flex items-center justify-center gap-4" style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: !annual ? INK : INK_SOFT }}>
          Mensuel
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          style={{
            position: "relative", width: 48, height: 24, borderRadius: 99,
            border: "none", cursor: "pointer",
            background: annual ? ROSE : "rgba(26,14,18,0.12)",
            transition: "background 0.2s",
          }}
        >
          <div style={{
            position: "absolute", top: 4, width: 16, height: 16, background: "white",
            borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
            transform: annual ? "translateX(28px)" : "translateX(4px)",
          }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: annual ? INK : INK_SOFT }}>
          Annuel
          <span style={{
            marginLeft: 6, fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 99,
            background: "rgba(27,122,74,0.1)", color: "#1B7A4A",
          }}>
            -17%
          </span>
        </span>
      </div>

      {/* Plans cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 40 }}>
        {planOrder.map((pid) => {
          const p = PLANS[pid];
          const isCurrent = pid === plan;
          const colors = PLAN_COLORS[pid];
          const Icon = PLAN_ICONS[pid];
          const price = getPrice(p.price);

          return (
            <div
              key={pid}
              style={{
                borderRadius: 18,
                border: p.highlight
                  ? `1px solid ${ROSE}`
                  : isCurrent
                  ? `2px solid rgba(224,32,96,0.3)`
                  : "1px solid rgba(0,0,0,0.06)",
                padding: 20,
                display: "flex", flexDirection: "column",
                position: "relative",
                background: "white",
                boxShadow: p.highlight
                  ? `0 8px 24px rgba(224,32,96,0.1)`
                  : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {p.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: ROSE, color: "white", fontSize: 9, fontWeight: 800,
                  padding: "4px 12px", borderRadius: 99, letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  Populaire
                </div>
              )}
              {isCurrent && (
                <div style={{
                  position: "absolute", top: -12, right: 16,
                  background: "#1B7A4A", color: "white", fontSize: 9, fontWeight: 800,
                  padding: "4px 10px", borderRadius: 99, textTransform: "uppercase",
                }}>
                  Plan actuel
                </div>
              )}

              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: colors.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Icon size={18} style={{ color: colors.iconColor }} />
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", marginBottom: 4 }}>{p.name}</h3>
              <p style={{ color: INK_SOFT, fontSize: 13, marginBottom: 16 }}>{p.description}</p>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{price}€</span>
                <span style={{ color: INK_SOFT, fontSize: 13 }}>/mois</span>
                {annual && (
                  <div style={{ fontSize: 11, color: "#1B7A4A", fontWeight: 600, marginTop: 2 }}>
                    Soit {price * 12}€/an — économisez {Math.round(p.price * 12 * discount)}€
                  </div>
                )}
              </div>

              {/* Highlights du plan */}
              <ul className="space-y-2 flex-1" style={{ marginBottom: 20, paddingLeft: 0, listStyle: "none" }}>
                <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                  <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                  {formatLimit(p.features.properties_limit)} propriétés
                </li>
                <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                  <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                  {formatLimit(p.features.team_members_limit)} membres d'équipe
                </li>
                {p.features.ai_pricing && (
                  <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                    <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                    Tarification IA
                  </li>
                )}
                {p.features.ai_assistant && (
                  <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                    <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                    Assistant IA
                  </li>
                )}
                {p.features.advanced_analytics && (
                  <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                    <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                    Analytics avancées
                  </li>
                )}
                {p.features.api_access && (
                  <li className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                    <Check size={14} style={{ color: "#1B7A4A", flexShrink: 0 }} />
                    Accès API + White Label
                  </li>
                )}
              </ul>

              <button
                disabled={isCurrent}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
                  cursor: isCurrent ? "default" : "pointer", transition: "opacity 0.15s",
                  ...(isCurrent
                    ? { background: PAPER, color: INK_SOFT, border: "1px solid rgba(0,0,0,0.06)" }
                    : p.highlight
                    ? { background: ROSE, color: "white", border: "none" }
                    : { background: "white", color: INK, border: `1px solid rgba(0,0,0,0.12)` }),
                }}
              >
                {isCurrent ? "Plan actuel" : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tableau comparatif */}
      <div style={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ background: PAPER, padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontWeight: 700, color: INK, fontSize: 14 }}>Comparaison détaillée</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th className="text-left" style={{ ...monoLabel, padding: "12px 24px", width: 192 }}>Fonctionnalité</th>
                {planOrder.map((pid) => (
                  <th key={pid} style={{
                    padding: "12px 16px", textAlign: "center",
                    fontWeight: 800, fontSize: 13,
                    color: pid === plan ? ROSE : INK,
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}>
                    {PLANS[pid].name}
                    {pid === plan && <span style={{ display: "block", fontSize: 10, color: INK_SOFT, fontWeight: 500 }}>actuel</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES_TABLE.map(({ key, label, isLimit }) => (
                <tr key={key} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <td style={{ padding: "10px 24px", color: INK, fontWeight: 600, fontSize: 13 }}>{label}</td>
                  {planOrder.map((pid) => {
                    const val = PLANS[pid].features[key as keyof typeof PLANS["pro"]["features"]];
                    const isCur = pid === plan;
                    return (
                      <td key={pid} style={{
                        padding: "10px 16px", textAlign: "center",
                        background: isCur ? "rgba(224,32,96,0.03)" : "transparent",
                      }}>
                        {isLimit ? (
                          <span style={{ fontWeight: 700, color: isCur ? ROSE : INK }}>
                            {formatLimit(val as number)}
                          </span>
                        ) : val ? (
                          <Check size={16} style={{ margin: "0 auto", color: isCur ? ROSE : "#1B7A4A" }} />
                        ) : (
                          <Lock size={14} style={{ margin: "0 auto", color: "rgba(0,0,0,0.15)" }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ textAlign: "center", color: INK_SOFT, fontSize: 11, marginTop: 24 }}>
        Pas d'engagement · Résiliation à tout moment · Données exportables
      </p>
    </div>
  );
}

// Barre d'utilisation
function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
  const isUnlimited = limit === -1;
  const isWarning = !isUnlimited && pct >= 80;

  return (
    <div style={{ minWidth: 100 }}>
      <div className="flex justify-between" style={{ fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: INK_SOFT }}>{label}</span>
        <span style={{ fontWeight: 700, color: isWarning ? "#C0A060" : INK }}>
          {current}/{isUnlimited ? "∞" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div style={{ height: 6, background: "rgba(26,14,18,0.08)", borderRadius: 99, overflow: "hidden", width: 96 }}>
          <div
            style={{
              height: "100%", borderRadius: 99, transition: "width 0.3s",
              background: isWarning ? "#C0A060" : ROSE,
              width: `${pct}%`,
            }}
          />
        </div>
      )}
      {isUnlimited && <div style={{ fontSize: 11, color: INK_SOFT }}>Illimité</div>}
    </div>
  );
}

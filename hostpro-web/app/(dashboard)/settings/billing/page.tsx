"use client";
import { useState } from "react";
import { Check, Zap, Lock, Star, Building2, Crown, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { PLANS, PlanId, formatLimit } from "@/lib/plans";
import { cn } from "@/lib/utils";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// Icônes par plan
const PLAN_ICONS: Record<PlanId, LucideIcon> = {
  trial:      Zap,
  starter:    Star,
  pro:        Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<PlanId, { bg: string; text: string; border: string; badge: string }> = {
  trial:      { bg: "bg-[#F7F7F7]",      text: "text-[#717171]", border: "border-[#DDDDDD]",      badge: "bg-[#717171]" },
  starter:    { bg: "bg-blue-50",         text: "text-blue-700",  border: "border-blue-200",        badge: "bg-blue-600" },
  pro:        { bg: "bg-[#FF5A5F]/5",    text: "text-[#FF5A5F]", border: "border-[#FF5A5F]/30",   badge: "bg-[#FF5A5F]" },
  enterprise: { bg: "bg-[#222222]/5",    text: "text-[#222222]", border: "border-[#222222]/20",   badge: "bg-[#222222]" },
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

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#222222]">Abonnement</h1>
        <p className="text-[#717171] mt-1">Gérez votre plan et vos fonctionnalités</p>
      </div>

      {/* Plan actuel */}
      <div className={cn(
        "rounded-2xl border p-5 mb-8",
        PLAN_COLORS[plan as PlanId]?.bg ?? "bg-[#F7F7F7]",
        PLAN_COLORS[plan as PlanId]?.border ?? "border-[#DDDDDD]",
      )}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white",
              PLAN_COLORS[plan as PlanId]?.badge ?? "bg-[#717171]",
            )}>
              {(() => { const Icon: LucideIcon = PLAN_ICONS[plan as PlanId] ?? Zap; return <Icon size={22} />; })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#222222]">
                  Plan {PLANS[plan as PlanId]?.name ?? plan}
                </h2>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full text-white uppercase",
                  status === "trialing" ? "bg-amber-500" : "bg-green-500",
                )}>
                  {status === "trialing" ? "Essai" : status === "active" ? "Actif" : status ?? "Inconnu"}
                </span>
              </div>
              <p className="text-[#717171] text-sm mt-0.5">
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
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={cn("text-sm font-medium", !annual ? "text-[#222222]" : "text-[#717171]")}>
          Mensuel
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            annual ? "bg-[#FF5A5F]" : "bg-[#DDDDDD]"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
            annual ? "translate-x-7" : "translate-x-1"
          )} />
        </button>
        <span className={cn("text-sm font-medium", annual ? "text-[#222222]" : "text-[#717171]")}>
          Annuel
          <span className="ml-1.5 text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
            -17%
          </span>
        </span>
      </div>

      {/* Plans cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {planOrder.map((pid) => {
          const p = PLANS[pid];
          const isCurrent = pid === plan;
          const colors = PLAN_COLORS[pid];
          const Icon = PLAN_ICONS[pid];
          const price = getPrice(p.price);

          return (
            <div
              key={pid}
              className={cn(
                "rounded-2xl border p-5 flex flex-col relative transition-shadow",
                p.highlight
                  ? "border-[#FF5A5F] shadow-lg shadow-[#FF5A5F]/10"
                  : "border-[#DDDDDD]",
                isCurrent && "ring-2 ring-[#FF5A5F]/30",
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5A5F] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  Populaire
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Plan actuel
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4", colors.badge)}>
                <Icon size={18} />
              </div>

              <h3 className="text-lg font-bold text-[#222222]">{p.name}</h3>
              <p className="text-[#717171] text-sm mb-4">{p.description}</p>

              <div className="mb-5">
                <span className="text-3xl font-black text-[#222222]">{price}€</span>
                <span className="text-[#717171] text-sm">/mois</span>
                {annual && (
                  <div className="text-xs text-green-600 font-medium mt-0.5">
                    Soit {price * 12}€/an — économisez {Math.round(p.price * 12 * discount)}€
                  </div>
                )}
              </div>

              {/* Highlights du plan */}
              <ul className="space-y-2 flex-1 mb-5">
                <li className="flex items-center gap-2 text-sm text-[#222222]">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  {formatLimit(p.features.properties_limit)} propriétés
                </li>
                <li className="flex items-center gap-2 text-sm text-[#222222]">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  {formatLimit(p.features.team_members_limit)} membres d'équipe
                </li>
                {p.features.ai_pricing && (
                  <li className="flex items-center gap-2 text-sm text-[#222222]">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    Tarification IA
                  </li>
                )}
                {p.features.ai_assistant && (
                  <li className="flex items-center gap-2 text-sm text-[#222222]">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    Assistant IA
                  </li>
                )}
                {p.features.advanced_analytics && (
                  <li className="flex items-center gap-2 text-sm text-[#222222]">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    Analytics avancées
                  </li>
                )}
                {p.features.api_access && (
                  <li className="flex items-center gap-2 text-sm text-[#222222]">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    Accès API + White Label
                  </li>
                )}
              </ul>

              <button
                disabled={isCurrent}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isCurrent
                    ? "bg-[#F7F7F7] text-[#BBBBBB] cursor-default"
                    : p.highlight
                    ? "bg-[#FF5A5F] hover:bg-[#e04a4f] text-white"
                    : "border border-[#DDDDDD] hover:border-[#FF5A5F] hover:text-[#FF5A5F] text-[#222222]"
                )}
              >
                {isCurrent ? "Plan actuel" : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tableau comparatif */}
      <div className="rounded-2xl border border-[#DDDDDD] overflow-hidden">
        <div className="bg-[#F7F7F7] px-6 py-4 border-b border-[#DDDDDD]">
          <h2 className="font-bold text-[#222222]">Comparaison détaillée</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDDDDD]">
                <th className="text-left px-6 py-3 text-[#717171] font-medium w-48">Fonctionnalité</th>
                {planOrder.map((pid) => (
                  <th key={pid} className={cn(
                    "px-4 py-3 text-center font-bold",
                    pid === plan ? "text-[#FF5A5F]" : "text-[#222222]"
                  )}>
                    {PLANS[pid].name}
                    {pid === plan && <span className="block text-[10px] text-[#717171] font-normal">actuel</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES_TABLE.map(({ key, label, isLimit }) => (
                <tr key={key} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA]">
                  <td className="px-6 py-3 text-[#222222] font-medium">{label}</td>
                  {planOrder.map((pid) => {
                    const val = PLANS[pid].features[key as keyof typeof PLANS["pro"]["features"]];
                    const isCur = pid === plan;
                    return (
                      <td key={pid} className={cn("px-4 py-3 text-center", isCur && "bg-[#FF5A5F]/3")}>
                        {isLimit ? (
                          <span className={cn("font-semibold", isCur ? "text-[#FF5A5F]" : "text-[#222222]")}>
                            {formatLimit(val as number)}
                          </span>
                        ) : val ? (
                          <Check size={16} className={cn("mx-auto", isCur ? "text-[#FF5A5F]" : "text-green-500")} />
                        ) : (
                          <Lock size={14} className="mx-auto text-[#DDDDDD]" />
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

      <p className="text-center text-[#717171] text-xs mt-6">
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
    <div className="min-w-[100px]">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#717171]">{label}</span>
        <span className={cn("font-semibold", isWarning ? "text-amber-600" : "text-[#222222]")}>
          {current}/{isUnlimited ? "∞" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-[#DDDDDD] rounded-full overflow-hidden w-24">
          <div
            className={cn("h-full rounded-full transition-all", isWarning ? "bg-amber-500" : "bg-[#FF5A5F]")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && <div className="text-xs text-[#717171]">Illimité</div>}
    </div>
  );
}

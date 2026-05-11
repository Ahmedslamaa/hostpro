"use client";
import { X, Zap, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlanFeatures, getPlan, nextPlan, PLANS } from "@/lib/plans";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: keyof PlanFeatures;
  title?: string;
  description?: string;
}

const FEATURE_LABELS: Partial<Record<keyof PlanFeatures, string>> = {
  ai_pricing:          "Tarification IA",
  ai_assistant:        "Assistant IA",
  advanced_analytics:  "Analytics avancées",
  accounting:          "Comptabilité",
  automation:          "Automatisation",
  api_access:          "Accès API",
  white_label:         "White Label",
  priority_support:    "Support prioritaire",
  multi_currency:      "Multi-devises",
  reservations_export: "Export des réservations",
};

export function UpgradeModal({ open, onClose, feature, title, description }: UpgradeModalProps) {
  const router = useRouter();
  const { plan } = useSubscriptionStore();
  const next = nextPlan(plan);
  const featureLabel = feature ? FEATURE_LABELS[feature] ?? feature : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#FF5A5F] to-[#e04a4f] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Fonctionnalité réservée</p>
              <h2 className="text-xl font-bold">
                {title ?? (featureLabel ? `Débloquer ${featureLabel}` : "Passez à la version supérieure")}
              </h2>
            </div>
          </div>

          <p className="text-white/90 text-sm">
            {description ?? (
              featureLabel
                ? `${featureLabel} n'est pas disponible dans votre plan actuel "${getPlan(plan).name}".`
                : `Cette fonctionnalité nécessite un plan supérieur.`
            )}
          </p>
        </div>

        {/* Plans list */}
        <div className="p-6">
          <p className="text-[#717171] text-sm mb-4">Choisissez le plan qui vous convient :</p>

          <div className="space-y-3">
            {(["starter", "pro", "enterprise"] as const).map((pid) => {
              const p = PLANS[pid];
              const isCurrent = pid === plan;
              const isNext = pid === next?.id;

              return (
                <div
                  key={pid}
                  className={cn(
                    "border rounded-xl p-4 flex items-center justify-between transition-all",
                    isCurrent
                      ? "border-[#DDDDDD] bg-[#F7F7F7] opacity-60 cursor-default"
                      : isNext
                      ? "border-[#FF5A5F] bg-[#FF5A5F]/5 cursor-pointer hover:bg-[#FF5A5F]/10"
                      : "border-[#DDDDDD] cursor-pointer hover:border-[#FF5A5F]/40 hover:bg-[#F7F7F7]"
                  )}
                  onClick={() => !isCurrent && router.push("/settings/billing")}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      isNext ? "bg-[#FF5A5F] text-white" : "bg-[#F7F7F7] text-[#717171]"
                    )}>
                      {p.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#222222] text-sm">{p.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#717171] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                            Actuel
                          </span>
                        )}
                        {isNext && !isCurrent && (
                          <span className="text-[9px] bg-[#FF5A5F] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-[#717171] text-xs">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#222222]">
                      {p.price === 0 ? "Gratuit" : `${p.price}€`}
                      {p.price > 0 && <span className="text-[#717171] font-normal text-xs">/mois</span>}
                    </span>
                    {!isCurrent && <ArrowRight size={14} className="text-[#717171]" />}
                    {isCurrent && <Check size={14} className="text-[#717171]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { router.push("/settings/billing"); onClose(); }}
            className="w-full mt-4 bg-[#FF5A5F] hover:bg-[#e04a4f] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Voir tous les plans
          </button>

          <p className="text-center text-[#717171] text-xs mt-3">
            Pas d'engagement · Résiliation à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}

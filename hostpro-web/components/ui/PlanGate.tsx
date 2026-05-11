"use client";
import { useState, ReactNode } from "react";
import { Lock } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { PlanFeatures } from "@/lib/plans";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

// ── PlanGate — bloque un bloc entier si la feature n'est pas disponible ──────
interface PlanGateProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  /** Affiche un overlay avec cadenas au lieu de masquer complètement */
  overlay?: boolean;
  /** Titre personnalisé dans l'UpgradeModal */
  upgradeTitle?: string;
  upgradeDescription?: string;
  className?: string;
}

export function PlanGate({
  feature, children, overlay = true,
  upgradeTitle, upgradeDescription, className,
}: PlanGateProps) {
  const { can } = useSubscriptionStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (can(feature)) return <>{children}</>;

  if (!overlay) return null;

  return (
    <>
      <div
        className={cn("relative rounded-xl overflow-hidden cursor-pointer group", className)}
        onClick={() => setModalOpen(true)}
      >
        {/* Contenu flouté */}
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">
          {children}
        </div>

        {/* Overlay cadenas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="w-12 h-12 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-[#FF5A5F]/20 transition-colors">
            <Lock size={20} className="text-[#FF5A5F]" />
          </div>
          <p className="text-[#222222] font-semibold text-sm">Fonctionnalité verrouillée</p>
          <p className="text-[#717171] text-xs mt-0.5">Cliquez pour voir les plans</p>
        </div>
      </div>

      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        feature={feature}
        title={upgradeTitle}
        description={upgradeDescription}
      />
    </>
  );
}


// ── PlanBadge — badge "Pro" ou "Enterprise" sur les fonctionnalités ──────────
interface PlanBadgeProps {
  feature: keyof PlanFeatures;
  className?: string;
}

const FEATURE_MIN_PLAN: Partial<Record<keyof PlanFeatures, string>> = {
  ai_pricing:          "Pro",
  ai_assistant:        "Pro",
  advanced_analytics:  "Pro",
  accounting:          "Pro",
  multi_currency:      "Pro",
  api_access:          "Enterprise",
  white_label:         "Enterprise",
  priority_support:    "Enterprise",
};

export function PlanBadge({ feature, className }: PlanBadgeProps) {
  const { can } = useSubscriptionStore();
  if (can(feature)) return null;

  const label = FEATURE_MIN_PLAN[feature] ?? "Pro";
  return (
    <span className={cn(
      "text-[9px] font-black px-1.5 py-0.5 rounded-full",
      label === "Enterprise"
        ? "bg-[#222222] text-white"
        : "bg-[#FF5A5F] text-white",
      className,
    )}>
      {label}
    </span>
  );
}


// ── usePlanGate — hook pour les boutons et actions inline ────────────────────
export function usePlanGate(feature: keyof PlanFeatures) {
  const { can } = useSubscriptionStore();
  const [modalOpen, setModalOpen] = useState(false);

  const guard = (callback: () => void) => () => {
    if (!can(feature)) {
      setModalOpen(true);
      return;
    }
    callback();
  };

  const Modal = (
    <UpgradeModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      feature={feature}
    />
  );

  return { allowed: can(feature), guard, Modal, openModal: () => setModalOpen(true) };
}

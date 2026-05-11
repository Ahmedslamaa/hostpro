"use client";
import { useEffect, useState } from "react";
import { Shield, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = "hostpro_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const save = (c: ConsentState) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...c, saved_at: new Date().toISOString() }));
    setVisible(false);

    // Émettre un événement custom pour que les outils analytics puissent réagir
    window.dispatchEvent(new CustomEvent("hostpro:cookie-consent", { detail: c }));
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const acceptNecessary = () => save({ necessary: true, analytics: false, marketing: false });
  const saveCustom = () => save(consent);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6"
      role="dialog"
      aria-label="Gestion des cookies"
    >
      <div className="max-w-4xl mx-auto bg-white border border-[#DDDDDD] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-[#F7F7F7]">
          <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={18} className="text-[#FF5A5F]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#222222] text-sm">Vos données, votre contrôle</h3>
            <p className="text-xs text-[#717171] mt-1 leading-relaxed">
              HOST PRO utilise des cookies pour garantir le fonctionnement de la plateforme et améliorer votre expérience.
              Conformément au{" "}
              <strong className="text-[#222222]">RGPD</strong> et à la directive ePrivacy, vous pouvez personnaliser vos préférences.{" "}
              <Link href="/privacy" className="text-[#FF5A5F] hover:underline font-medium">
                Politique de confidentialité
              </Link>
            </p>
          </div>
          <button
            onClick={acceptNecessary}
            className="text-[#AAAAAA] hover:text-[#717171] shrink-0 transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Paramètres avancés */}
        {expanded && (
          <div className="px-5 py-4 space-y-3 border-b border-[#F7F7F7]">
            {[
              {
                key: "necessary" as const,
                label: "Cookies nécessaires",
                desc: "Authentification, sécurité de session, préférences de langue. Toujours actifs.",
                locked: true,
              },
              {
                key: "analytics" as const,
                label: "Cookies analytiques",
                desc: "Mesure d'audience anonymisée (Azure Application Insights). Aucune donnée personnelle partagée.",
                locked: false,
              },
              {
                key: "marketing" as const,
                label: "Cookies marketing",
                desc: "Non utilisés actuellement — réservés aux futures fonctionnalités partenaires.",
                locked: false,
              },
            ].map(({ key, label, desc, locked }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#222222]">{label}</p>
                  <p className="text-xs text-[#717171] mt-0.5 leading-snug">{desc}</p>
                </div>
                <div className={`relative w-10 h-5 rounded-full flex items-center shrink-0 mt-0.5 transition-colors ${
                  consent[key] ? "bg-[#FF5A5F]" : "bg-[#DDDDDD]"
                } ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => {
                    if (locked) return;
                    setConsent((c) => ({ ...c, [key]: !c[key] }));
                  }}
                >
                  <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    consent[key] ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-[#717171] hover:text-[#222222] transition-colors font-medium"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? "Réduire" : "Personnaliser"}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {expanded ? (
              <button
                onClick={saveCustom}
                className="text-xs border border-[#DDDDDD] text-[#222222] font-semibold px-4 py-2 rounded-xl hover:bg-[#F7F7F7] transition-all"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                onClick={acceptNecessary}
                className="text-xs border border-[#DDDDDD] text-[#222222] font-semibold px-4 py-2 rounded-xl hover:bg-[#F7F7F7] transition-all"
              >
                Nécessaires uniquement
              </button>
            )}
            <button
              onClick={acceptAll}
              className="text-xs bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

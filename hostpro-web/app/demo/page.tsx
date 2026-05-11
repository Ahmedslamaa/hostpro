"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

/** Page de démo — injecte une session Enterprise complète sans passer par le login */
export default function DemoPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { setSubscription } = useSubscriptionStore();

  useEffect(() => {
    // 1. Injecter le token dans localStorage (bypassé par le layout)
    localStorage.setItem("access_token", "demo-enterprise-token");
    localStorage.setItem("refresh_token", "demo-refresh-token");
    localStorage.setItem("tenant_id", "demo-tenant");

    // 2. Injecter l'utilisateur démo dans le store d'auth
    setAuth(
      {
        id: "demo-user",
        email: "demo@hostpro.fr",
        full_name: "Ahmed — Démo",
        tenants: [],
        avatar_url: null,
        is_superadmin: false,
        created_at: new Date().toISOString(),
      },
      "demo-enterprise-token",
      "demo-refresh-token",
      "demo-tenant"
    );

    // 3. Forcer le plan Enterprise avec tout débloqué
    setSubscription({
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
    });

    // 4. Rediriger vers le dashboard
    router.replace("/dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="text-center">
        <div className="font-black text-3xl tracking-[-0.02em] flex items-center gap-2 justify-center mb-4">
          <span className="text-[#222222]">HOST</span>
          <span className="bg-[#FF5A5F] text-white px-2 py-[3px] rounded-[6px] tracking-[0.02em]">PRO</span>
        </div>
        <p className="text-[#717171] text-sm">Chargement de la démo Enterprise…</p>
        <div className="mt-4 w-8 h-8 border-2 border-[#FF5A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

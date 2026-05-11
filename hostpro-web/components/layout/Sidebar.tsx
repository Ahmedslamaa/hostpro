"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { cn } from "@/lib/utils";
import type { PlanFeatures } from "@/lib/plans";
import { getPlan } from "@/lib/plans";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { LogoMark } from "@/components/ui/LogoMark";
import {
  LayoutDashboard, Home, CalendarDays, Calendar,
  MessageSquare, Shield, Users, Settings, LogOut,
  TrendingUp, Zap, Sparkles, BarChart2, Receipt, Plug, GitMerge, Lock,
  CreditCard, type LucideProps,
} from "lucide-react";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
  badge?: string;
  /** Feature requise pour accéder — si absente du plan, affiche un verrou */
  feature?: keyof PlanFeatures;
};

const nav: { group: string; items: NavItem[] }[] = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard",   label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: "/properties",  label: "Propriétés",       icon: Home,            exact: false },
    ],
  },
  {
    group: "Channel Manager",
    items: [
      { href: "/channel-manager", label: "Channel Manager",  icon: GitMerge,   exact: false },
      { href: "/reservations",    label: "Réservations",     icon: Calendar,   exact: false },
      { href: "/calendar",        label: "Calendrier unifié",icon: CalendarDays,exact: false },
      { href: "/pricing",         label: "Tarification IA",  icon: TrendingUp, exact: false, badge: "IA", feature: "ai_pricing" },
      { href: "/integrations",    label: "Intégrations",     icon: Plug,       exact: false },
    ],
  },
  {
    group: "Opérations",
    items: [
      { href: "/automation", label: "Automatisation", icon: Zap,          exact: false, feature: "automation" },
      { href: "/messages",   label: "Messages",        icon: MessageSquare,exact: false },
      { href: "/team",       label: "Équipe",           icon: Users,       exact: false },
      { href: "/assistant",  label: "Assistant IA",    icon: Sparkles,    exact: false, badge: "IA", feature: "ai_assistant" },
    ],
  },
  {
    group: "Gestion",
    items: [
      { href: "/analytics",  label: "Analytics",    icon: BarChart2, exact: false, feature: "advanced_analytics" },
      { href: "/accounting", label: "Comptabilité", icon: Receipt,   exact: false, feature: "accounting" },
      { href: "/compliance", label: "Conformité",   icon: Shield,    exact: false },
    ],
  },
  {
    group: "Compte",
    items: [
      { href: "/settings/billing", label: "Abonnement", icon: CreditCard, exact: false },
      { href: "/settings",         label: "Paramètres", icon: Settings,   exact: false },
    ],
  },
];

// Badge couleur selon le plan
const PLAN_COLORS: Record<string, string> = {
  trial:      "bg-[#717171] text-white",
  starter:    "bg-[#0070f3] text-white",
  pro:        "bg-[#FF5A5F] text-white",
  enterprise: "bg-[#222222] text-white",
};

export function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const { can, plan, isTrialing, limit } = useSubscriptionStore();

  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature?: keyof PlanFeatures }>({ open: false });

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = (name?: string | null, email?: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return (email?.[0] || "U").toUpperCase();
  };

  const planDef = getPlan(plan);

  return (
    <>
      <aside className="w-60 min-h-screen bg-white border-r border-[#DDDDDD] flex flex-col fixed left-0 top-0 h-screen z-30">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#DDDDDD]">
          <LogoMark variant="light" size="md" />
          <div className="text-xs text-[#717171] mt-1">Gestion locative IA</div>
        </div>

        {/* Plan badge */}
        <div className="px-4 pt-3 pb-1">
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-xl text-xs",
            isTrialing() ? "bg-amber-50 border border-amber-200" : "bg-[#F7F7F7]"
          )}>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold px-1.5 py-0.5 rounded-md text-[10px]", PLAN_COLORS[plan] ?? PLAN_COLORS.trial)}>
                {planDef.name.toUpperCase()}
              </span>
              {isTrialing() && <span className="text-amber-700 font-medium">Essai</span>}
            </div>
            <button
              onClick={() => router.push("/settings/billing")}
              className="text-[#FF5A5F] font-semibold hover:underline"
            >
              Gérer
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {nav.map(({ group, items }) => (
            <div key={group} className="mb-4">
              <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#BBBBBB]">
                {group}
              </div>
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, exact, badge, feature }) => {
                  const isActive  = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
                  const isLocked  = !!feature && !can(feature);

                  if (isLocked) {
                    return (
                      <button
                        key={href}
                        onClick={() => setUpgradeModal({ open: true, feature })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#BBBBBB] hover:bg-[#F7F7F7] hover:text-[#717171] transition-all"
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span className="flex-1 truncate text-left">{label}</span>
                        <Lock size={12} className="flex-shrink-0 text-[#BBBBBB]" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#FF5A5F]/10 text-[#FF5A5F] font-semibold"
                          : "text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]"
                      )}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="text-[9px] font-black bg-[#FF5A5F] text-white px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-[#DDDDDD] p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl hover:bg-[#F7F7F7] transition-colors">
            <div className="w-8 h-8 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#FF5A5F] text-xs font-bold">
                {initials(user?.full_name, user?.email)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#222222] text-sm font-semibold truncate">{user?.full_name || "Utilisateur"}</div>
              <div className="text-[#717171] text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222] transition-all"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false })}
        feature={upgradeModal.feature}
      />
    </>
  );
}

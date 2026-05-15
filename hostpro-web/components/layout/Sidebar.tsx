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
import { colors, spacing } from "@/lib/design-system";
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

// Badge color by plan
const PLAN_COLORS: Record<string, string> = {
  trial:      "bg-neutral-600 text-white",
  starter:    "bg-secondary-500 text-white",
  pro:        "bg-primary-500 text-white",
  enterprise: "bg-neutral-900 text-white",
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
      <aside className="w-60 min-h-screen bg-white border-r border-neutral-200 flex flex-col fixed left-0 top-0 h-screen z-30">

        {/* Logo - Clickable for navigation to dashboard */}
        <Link href="/dashboard" className="group">
          <div className="px-6 py-5 border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-200 cursor-pointer">
            <LogoMark variant="light" size="md" />
            <div className="text-xs text-neutral-500 mt-2 group-hover:text-neutral-600 transition-colors duration-200">
              Gestion locative IA
            </div>
          </div>
        </Link>

        {/* Plan badge */}
        <div className="px-4 pt-3 pb-1">
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-xs",
            isTrialing() ? "bg-yellow-50 border border-yellow-200" : "bg-neutral-100"
          )}>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold px-1.5 py-0.5 rounded-md text-xs", PLAN_COLORS[plan] ?? PLAN_COLORS.trial)}>
                {planDef.name.toUpperCase()}
              </span>
              {isTrialing() && <span className="text-yellow-700 font-medium text-xs">Essai</span>}
            </div>
            <button
              onClick={() => router.push("/settings/billing")}
              className="text-primary-500 font-semibold hover:text-primary-600 transition-colors duration-200 text-xs"
            >
              Gérer
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          {nav.map(({ group, items }) => (
            <div key={group} className="mb-6">
              <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                {group}
              </div>
              <div className="space-y-1">
                {items.map(({ href, label, icon: Icon, exact, badge, feature }) => {
                  const isActive  = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
                  const isLocked  = !!feature && !can(feature);

                  if (isLocked) {
                    return (
                      <button
                        key={href}
                        onClick={() => setUpgradeModal({ open: true, feature })}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 transition-all duration-200"
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span className="flex-1 truncate text-left">{label}</span>
                        <Lock size={12} className="flex-shrink-0 text-neutral-300" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary-100 text-primary-600 font-semibold"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      )}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="text-xs font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full">
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
        <div className="border-t border-neutral-200 p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-default">
            <div className="w-8 h-8 bg-primary-100 border border-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 text-xs font-bold">
                {initials(user?.full_name, user?.email)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-neutral-900 text-sm font-semibold truncate">{user?.full_name || "Utilisateur"}</div>
              <div className="text-neutral-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
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

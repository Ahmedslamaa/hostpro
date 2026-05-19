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
      {/* ── Sidebar — Host Pro design system ── */}
      <aside className="w-60 min-h-screen bg-white flex flex-col fixed left-0 top-0 h-screen z-30"
        style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <LogoMark as="link" href="/dashboard" variant="light" size="md" />
          <div className="text-xs mt-1.5 hp-font-mono" style={{ color: "#6B5A60", letterSpacing: "0.05em" }}>
            Gestion locative IA
          </div>
        </div>

        {/* Plan badge */}
        <div className="px-4 pt-3 pb-1">
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-xl text-xs",
            isTrialing()
              ? "border"
              : ""
          )}
            style={isTrialing()
              ? { background: "rgba(224,192,128,0.15)", borderColor: "rgba(192,160,96,0.3)" }
              : { background: "rgba(26,14,18,0.04)" }
            }
          >
            <div className="flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 rounded-lg text-xs text-white"
                style={{ background: "#E02060" }}>
                {planDef.name.toUpperCase()}
              </span>
              {isTrialing() && (
                <span className="font-medium text-xs" style={{ color: "#C0A060" }}>Essai</span>
              )}
            </div>
            <button
              onClick={() => router.push("/settings/billing")}
              className="font-semibold text-xs transition-opacity hover:opacity-70"
              style={{ color: "#E02060" }}
            >
              Gérer
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          {nav.map(({ group, items }) => (
            <div key={group} className="mb-5">
              <div className="px-3 mb-1.5 text-xs font-bold uppercase tracking-widest hp-font-mono"
                style={{ color: "#6B5A60", letterSpacing: "0.1em", fontSize: 10 }}>
                {group}
              </div>
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, exact, badge, feature }) => {
                  const isActive = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
                  const isLocked = !!feature && !can(feature);

                  if (isLocked) {
                    return (
                      <button
                        key={href}
                        onClick={() => setUpgradeModal({ open: true, feature })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                        style={{ color: "#6B5A60" }}
                      >
                        <Icon size={15} className="flex-shrink-0 opacity-50" />
                        <span className="flex-1 truncate text-left">{label}</span>
                        <Lock size={11} className="flex-shrink-0 opacity-30" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                      )}
                      style={isActive
                        ? { background: "rgba(224,32,96,0.08)", color: "#C00040", fontWeight: 600 }
                        : { color: "#1A0E12" }
                      }
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(26,14,18,0.04)"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Icon size={15} className="flex-shrink-0"
                        style={{ color: isActive ? "#E02060" : "#6B5A60" }} />
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: "#E02060", fontSize: 10 }}>
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
        <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-default"
            style={{ background: "rgba(26,14,18,0.03)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: "linear-gradient(140deg, #E04060, #C00040)" }}>
              {initials(user?.full_name, user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "#1A0E12" }}>{user?.full_name || "Utilisateur"}</div>
              <div className="text-xs truncate hp-font-mono" style={{ color: "#6B5A60" }}>{user?.email}</div>
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

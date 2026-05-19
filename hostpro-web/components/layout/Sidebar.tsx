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
  const [collapsed, setCollapsed] = useState(false);

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
      <aside
        className="bg-white flex flex-col"
        style={{
          borderRight: "1px solid rgba(0,0,0,0.06)",
          width: collapsed ? 72 : 240,
          minWidth: collapsed ? 72 : 240,
          transition: "width 0.2s cubic-bezier(0.16,1,0.3,1), min-width 0.2s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 30,
        }}>

        {/* Logo + collapse toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: collapsed ? "18px 10px" : "18px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          minHeight: 70,
        }}>
          {!collapsed && (
            <div>
              <LogoMark as="link" href="/dashboard" variant="light" size="md" />
              <div className="hp-font-mono" style={{ fontSize: 9, color: "#6B5A60", letterSpacing: "0.12em", marginTop: 2 }}>
                Gestion locative IA
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(0,0,0,0.04)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6B5A60", fontSize: 13, flexShrink: 0,
              marginLeft: collapsed ? "auto" : 0,
            }}
            title={collapsed ? "Développer" : "Réduire"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Plan badge */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl text-xs",
              isTrialing() ? "border" : ""
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
        )}

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
          style={{ padding: collapsed ? "12px 10px" : "12px 12px" }}>
          {nav.map(({ group, items }) => (
            <div key={group} className="mb-5">
              {!collapsed && (
                <div className="px-3 mb-1.5 hp-font-mono"
                  style={{ color: "#6B5A60", letterSpacing: "0.1em", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  {group}
                </div>
              )}
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, exact, badge, feature }) => {
                  const isActive = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
                  const isLocked = !!feature && !can(feature);

                  if (isLocked) {
                    return (
                      <button
                        key={href}
                        onClick={() => setUpgradeModal({ open: true, feature })}
                        title={collapsed ? label : undefined}
                        className="w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150"
                        style={{
                          color: "#6B5A60",
                          gap: collapsed ? 0 : 10,
                          padding: collapsed ? 10 : "9px 12px",
                          justifyContent: collapsed ? "center" : "flex-start",
                        }}
                      >
                        <Icon size={15} className="flex-shrink-0 opacity-50" />
                        {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
                        {!collapsed && <Lock size={11} className="flex-shrink-0 opacity-30" />}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={href}
                      href={href}
                      title={collapsed ? label : undefined}
                      className={cn("flex items-center rounded-xl text-sm font-medium transition-all duration-150")}
                      style={{
                        gap: collapsed ? 0 : 10,
                        padding: collapsed ? 10 : "9px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        ...(isActive
                          ? { background: "rgba(224,32,96,0.08)", color: "#C00040", fontWeight: 600 }
                          : { color: "#1A0E12" }),
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(26,14,18,0.04)"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = isActive ? "rgba(224,32,96,0.08)" : "transparent"; }}
                    >
                      <Icon size={15} className="flex-shrink-0"
                        style={{ color: isActive ? "#E02060" : "#6B5A60" }} />
                      {!collapsed && <span className="flex-1 truncate">{label}</span>}
                      {!collapsed && badge && (
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
        <div style={{ padding: collapsed ? "10px" : "12px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Déconnexion" : undefined}
            style={{
              display: "flex", alignItems: "center",
              gap: collapsed ? 0 : 10,
              padding: collapsed ? 9 : "9px 10px",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 10, background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              color: "#1A0E12",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 99,
              background: "linear-gradient(140deg, #E04060, #C00040)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 11, flexShrink: 0,
            }}>
              {initials(user?.full_name, user?.email)}
            </div>
            {!collapsed && (
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1A0E12" }}>
                  {user?.full_name || "Utilisateur"}
                </div>
                <div className="hp-font-mono" style={{ fontSize: 9, color: "#6B5A60" }}>Se déconnecter ↗</div>
              </div>
            )}
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

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ToastContainer } from "@/components/ui/Toast";
import {
  Bell, AlertTriangle, CheckCircle2, XCircle,
  LogOut, User, Settings, ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { colors, spacing } from "@/lib/design-system";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/properties": "Propriétés",
  "/reservations": "Réservations",
  "/calendar": "Calendrier",
  "/tasks": "Tâches",
  "/messages": "Messages",
  "/analytics": "Analytics",
  "/accounting": "Comptabilité",
  "/compliance": "Conformité",
  "/automation": "Automatisations",
  "/team": "Équipe",
  "/assistant": "Assistant IA",
  "/pricing": "Tarification IA",
  "/channel-manager": "Channel Manager",
  "/integrations": "Intégrations",
  "/settings": "Paramètres",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (key !== "/" && pathname.startsWith(key + "/")) return title;
  }
  return "HOST PRO";
}

function initials(name?: string | null, email?: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (email?.[0] || "U").toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    fetch("/api/v1/dashboard/alerts")
      .then(r => r.json())
      .then(d => setAlerts(Array.isArray(d) ? d : []))
      .catch(() => setAlerts([]));
  }, []);

  const pageTitle = getPageTitle(pathname);
  const unreadCount = alerts.length - readNotifs.size;

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("tenant_id");
    }
    router.replace("/login");
  };

  const markAllRead = () =>
    setReadNotifs(new Set<string>(alerts.map((_, i) => String(i))));

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* ── Top header ──────────────────────────────────────────── */}
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 lg:px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button onClick={() => {}} className="lg:hidden"><MobileMenu /></button>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{pageTitle}</h1>

          <div className="flex items-center gap-2">

            {/* ── Notifications bell ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200 relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                    <span className="font-semibold text-neutral-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-500 font-medium hover:text-primary-600 transition-colors">
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                    {alerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                        <CheckCircle2 size={28} className="text-neutral-300 mb-2" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      alerts.map((alert, i) => {
                        const isRead = readNotifs.has(String(i));
                        const dotColor =
                          alert.severity === "critical" ? "bg-red-500"
                          : alert.severity === "warning" ? "bg-amber-500"
                          : "bg-blue-500";
                        return (
                          <div
                            key={i}
                            onClick={() => setReadNotifs((s) => { const n = new Set(Array.from(s)); n.add(String(i)); return n; })}
                            className={`px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors duration-150 ${isRead ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                              <div>
                                <p className="text-xs font-semibold text-neutral-900">{alert.property_name}</p>
                                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">{alert.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-neutral-200 bg-neutral-50">
                    <button
                      onClick={() => { router.push("/compliance"); setNotifOpen(false); }}
                      className="text-xs text-primary-500 font-medium hover:text-primary-600 transition-colors"
                    >
                      Voir toutes les alertes 
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile menu ── */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-primary-100 border border-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-xs font-bold">
                    {initials(user?.full_name, user?.email)}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-neutral-600 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{user?.full_name || "Utilisateur"}</p>
                    <p className="text-xs text-neutral-600 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors duration-150"
                    >
                      <User size={14} className="text-neutral-600" />
                      Mon profil
                    </button>
                    <button
                      onClick={() => { router.push("/settings/billing"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors duration-150"
                    >
                      <Settings size={14} className="text-neutral-600" />
                      Paramètres
                    </button>
                  </div>

                  <div className="border-t border-neutral-200 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors duration-150 font-medium"
                    >
                      <LogOut size={14} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Global toasts ── */}
      <ToastContainer />
    </div>
  );
}

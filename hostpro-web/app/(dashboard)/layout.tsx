"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/Toast";
import {
  Bell, AlertTriangle, CheckCircle2, XCircle,
  LogOut, User, Settings, ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

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
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        {/* ── Top header ──────────────────────────────────────────── */}
        <header className="bg-white border-b border-[#DDDDDD] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold text-[#222222]">{pageTitle}</h1>

          <div className="flex items-center gap-2">

            {/* ── Notifications bell ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                className="w-10 h-10 rounded-xl border border-[#DDDDDD] flex items-center justify-center text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222] transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#FF5A5F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#DDDDDD] rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDDDDD]">
                    <span className="font-bold text-[#222222] text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-[#FF5A5F] font-medium hover:underline">
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F7F7F7]">
                    {alerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-[#717171]">
                        <CheckCircle2 size={28} className="text-[#DDDDDD] mb-2" />
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
                            className={`px-4 py-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors ${isRead ? "opacity-40" : ""}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                              <div>
                                <p className="text-xs font-semibold text-[#222222]">{alert.property_name}</p>
                                <p className="text-xs text-[#717171] mt-0.5 leading-snug">{alert.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#DDDDDD]">
                    <button
                      onClick={() => { router.push("/compliance"); setNotifOpen(false); }}
                      className="text-xs text-[#FF5A5F] font-medium hover:underline"
                    >
                      Voir toutes les alertes →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile menu ── */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-all group"
              >
                <div className="w-8 h-8 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#FF5A5F] text-xs font-bold">
                    {initials(user?.full_name, user?.email)}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-[#717171] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-[#DDDDDD] rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#DDDDDD] bg-[#F7F7F7]">
                    <p className="text-sm font-semibold text-[#222222] truncate">{user?.full_name || "Utilisateur"}</p>
                    <p className="text-xs text-[#717171] truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      <User size={14} className="text-[#717171]" />
                      Mon profil
                    </button>
                    <button
                      onClick={() => { router.push("/settings/billing"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Settings size={14} className="text-[#717171]" />
                      Paramètres
                    </button>
                  </div>

                  <div className="border-t border-[#DDDDDD] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* ── Global toasts ── */}
      <ToastContainer />
    </div>
  );
}

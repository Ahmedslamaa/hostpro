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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // Command palette keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQ(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const PAGE_ICONS: Record<string, string> = {
    "/dashboard": "◐", "/properties": "◇", "/reservations": "◑",
    "/calendar": "◉", "/messages": "💬", "/analytics": "◎",
    "/automation": "⚡", "/assistant": "✦", "/pricing": "◈",
    "/team": "◬", "/settings": "⚙",
  };
  const pageIcon = PAGE_ICONS[pathname] || PAGE_ICONS[Object.keys(PAGE_ICONS).find(k => k !== "/" && pathname.startsWith(k + "/")) || ""] || "◐";

  const searchItems = Object.entries(PAGE_TITLES).map(([href, label]) => ({ href, label }));
  const filteredItems = searchItems.filter(i => i.label.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#E0E0E0" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>

        {/* ── Top header ──────────────────────────────────────────── */}
        <header style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          position: "sticky", top: 0, zIndex: 30,
        }}>
          {/* Left: page identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(224,32,96,0.08)",
              color: "#E02060",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>{pageIcon}</div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#6B5A60", letterSpacing: "0.15em" }}>HOST PRO</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "#1A0E12" }}>{pageTitle}</div>
            </div>
          </div>

          {/* Center: search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "white", borderRadius: 10, padding: "8px 14px",
              border: "1px solid rgba(0,0,0,0.08)", fontSize: 13, color: "#6B5A60",
              flex: 1, maxWidth: 380, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}>
            <span>⌕</span>
            <span style={{ flex: 1, textAlign: "left" }}>Rechercher logement, réservation…</span>
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, padding: "2px 6px", background: "rgba(0,0,0,0.05)", borderRadius: 4 }}>⌘K</span>
          </button>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* ── Notifications bell ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "transparent", border: "1px solid rgba(0,0,0,0.08)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#6B5A60", position: "relative",
                }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 4,
                    width: 7, height: 7, borderRadius: 99, background: "#E02060",
                  }} />
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

            {/* ── + Action button ── */}
            <button
              onClick={() => router.push("/reservations/new")}
              style={{
                background: "#1A0E12", color: "#F4F2F0",
                border: "none", borderRadius: 10, padding: "9px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >+ Action</button>

            {/* ── Profile menu ── */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 10,
                  background: "transparent", border: "1px solid rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: "linear-gradient(140deg, #E04060, #C00040)",
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 11,
                }}>
                  {initials(user?.full_name, user?.email)}
                </div>
                <ChevronDown size={12} color="#6B5A60" style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0)" }} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-neutral-200" style={{ background: "#F4F2F0" }}>
                    <p className="text-sm font-semibold truncate" style={{ color: "#1A0E12" }}>{user?.full_name || "Utilisateur"}</p>
                    <p className="text-xs truncate" style={{ color: "#6B5A60", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors duration-150" style={{ color: "#1A0E12" }}>
                      <User size={14} color="#6B5A60" /> Mon profil
                    </button>
                    <button onClick={() => { router.push("/settings/billing"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors duration-150" style={{ color: "#1A0E12" }}>
                      <Settings size={14} color="#6B5A60" /> Paramètres
                    </button>
                  </div>

                  <div className="border-t border-neutral-200 py-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors duration-150 font-medium" style={{ color: "#C00040" }}>
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto" style={{ padding: "0" }}>
          {children}
        </main>
      </div>

      {/* ── Command palette ── */}
      {searchOpen && (
        <div
          onClick={() => { setSearchOpen(false); setSearchQ(""); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(26,14,18,0.45)",
            backdropFilter: "blur(4px)", zIndex: 50,
            display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "white", width: 520, borderRadius: 16,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Que cherchez-vous ?"
              style={{
                width: "100%", padding: "16px 20px",
                border: "none", outline: "none", fontSize: 14,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            />
            <div style={{ padding: 8, maxHeight: 320, overflow: "auto" }}>
              {filteredItems.map((it) => (
                <div
                  key={it.href}
                  onClick={() => { router.push(it.href); setSearchOpen(false); setSearchQ(""); }}
                  style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ width: 22, color: "#6B5A60" }}>{PAGE_ICONS[it.href] || "◇"}</span>
                  <span style={{ flex: 1, color: "#1A0E12", fontWeight: 500 }}>{it.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#6B5A60" }}>Enter</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Global toasts ── */}
      <ToastContainer />
    </div>
  );
}

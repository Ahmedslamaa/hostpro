"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Home, CalendarDays, Calendar,
  CheckSquare, MessageSquare, Shield, Users, Settings, LogOut,
} from "lucide-react";

const nav = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/properties", label: "Propriétés", icon: Home, exact: false },
  { href: "/reservations", label: "Réservations", icon: Calendar, exact: false },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays, exact: false },
  { href: "/tasks", label: "Tâches", icon: CheckSquare, exact: false },
  { href: "/messages", label: "Messages", icon: MessageSquare, exact: false },
  { href: "/compliance", label: "Conformité", icon: Shield, exact: false },
  { href: "/team", label: "Équipe", icon: Users, exact: false },
  { href: "/settings", label: "Paramètres", icon: Settings, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = (name: string | undefined | null, email: string | undefined) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return (email?.[0] || "U").toUpperCase();
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[#DDDDDD] flex flex-col fixed left-0 top-0 h-screen z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#DDDDDD]">
        <div className="flex items-center gap-2">
          <div className="text-[#222222] font-black text-xl tracking-tight">HOST</div>
          <div className="w-2 h-2 rounded-full bg-[#FF5A5F] -ml-1 mb-3" />
          <div className="text-[#222222] font-black text-xl tracking-tight -ml-1">PRO</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
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
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
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
  );
}

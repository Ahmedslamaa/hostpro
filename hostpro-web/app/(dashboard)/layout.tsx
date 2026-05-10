"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/": "Tableau de bord",
  "/properties": "Propriétés",
  "/reservations": "Réservations",
  "/calendar": "Calendrier",
  "/tasks": "Tâches",
  "/messages": "Messages",
  "/compliance": "Conformité",
  "/team": "Équipe",
  "/settings": "Paramètres",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (key !== "/" && pathname.startsWith(key + "/")) return title;
  }
  return "HOST PRO";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) router.replace("/login");
  }, [router]);

  const pageTitle = getPageTitle(pathname);

  const initials = (name: string | undefined | null, email: string | undefined) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return (email?.[0] || "U").toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white border-b border-[#DDDDDD] px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-bold text-[#222222]">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl border border-[#DDDDDD] flex items-center justify-center text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222] transition-all">
              <Bell size={18} />
            </button>
            <div className="w-9 h-9 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-full flex items-center justify-center">
              <span className="text-[#FF5A5F] text-sm font-bold">
                {initials(user?.full_name, user?.email)}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

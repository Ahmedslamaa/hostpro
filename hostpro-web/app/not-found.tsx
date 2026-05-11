import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <LogoMark variant="light" size="md" className="justify-center mb-8" />

        <div className="text-8xl font-black text-[#DDDDDD] mb-4 tracking-tighter">404</div>
        <h1 className="text-2xl font-bold text-[#222222] mb-2">Page introuvable</h1>
        <p className="text-[#717171] mb-8">
          Cette page n'existe pas ou a été déplacée. Revenez au tableau de bord.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Home size={16} /> Tableau de bord
          </Link>
          <Link
            href="javascript:history.back()"
            className="flex items-center gap-2 border border-[#DDDDDD] text-[#222222] font-semibold px-6 py-3 rounded-xl hover:bg-white transition-all"
          >
            <ArrowLeft size={16} /> Retour
          </Link>
        </div>
      </div>
    </div>
  );
}

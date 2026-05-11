"use client";
import { useEffect } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4">
        <LogoMark variant="light" size="md" className="justify-center mb-8" />
        <div className="text-8xl font-black text-[#DDDDDD] mb-4 tracking-tighter">500</div>
        <h1 className="text-2xl font-bold text-[#222222] mb-2">Erreur inattendue</h1>
        <p className="text-[#717171] mb-8 text-center max-w-sm">
          Un problème est survenu. Nos équipes ont été notifiées automatiquement.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-2 border border-[#DDDDDD] text-[#222222] font-semibold px-6 py-3 rounded-xl hover:bg-white transition-all"
          >
            <Home size={16} /> Tableau de bord
          </a>
        </div>
      </body>
    </html>
  );
}

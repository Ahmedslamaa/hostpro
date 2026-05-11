"use client";
import { useEffect } from "react";

/** Page de démo — redirige vers /api/v1/auth/demo qui pose un vrai cookie JWT */
export default function DemoPage() {
  useEffect(() => {
    window.location.href = "/api/v1/auth/demo";
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="text-center">
        <div className="font-black text-3xl tracking-[-0.02em] flex items-center gap-2 justify-center mb-4">
          <span className="text-[#222222]">HOST</span>
          <span className="bg-[#FF5A5F] text-white px-2 py-[3px] rounded-[6px] tracking-[0.02em]">PRO</span>
        </div>
        <p className="text-[#717171] text-sm">Chargement de la démo Enterprise…</p>
        <div className="mt-4 w-8 h-8 border-2 border-[#FF5A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

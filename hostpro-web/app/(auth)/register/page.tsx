"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    tenant_name: "",
    tenant_slug: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.register(form);
      const { access_token, refresh_token, user } = res.data;
      const me = await authApi.me();
      const tenantId = me.data.tenants?.[0]?.id || "";
      setAuth(user, access_token, refresh_token, tenantId);
      if (tenantId) localStorage.setItem("tenant_id", tenantId);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#222222] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 -translate-x-36" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 translate-x-48" />

        <div className="relative z-10 max-w-md">
          <div className="mb-12">
            <div className="text-white font-black text-4xl tracking-tight mb-2">HOSTPRO</div>
            <div className="w-12 h-1 bg-[#FF5A5F] rounded-full" />
          </div>

          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Démarrez votre essai gratuit de{" "}
            <span className="text-[#FF5A5F]">14 jours</span>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Rejoignez des centaines de gestionnaires locatifs qui font confiance à HostPro.
          </p>

          <div className="space-y-6">
            {[
              { title: "Aucune carte bancaire requise", desc: "Commencez gratuitement, sans engagement." },
              { title: "Configuration en 5 minutes", desc: "Importez vos biens et synchronisez vos calendriers instantanément." },
              { title: "Support dédié", desc: "Notre équipe vous accompagne à chaque étape." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#FF5A5F]/20 border border-[#FF5A5F]/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#FF5A5F] text-xs font-bold">0{i + 1}</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="text-white/50 text-sm mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="text-[#222222] font-black text-3xl tracking-tight">HOSTPRO</div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#222222]">Créer votre compte</h1>
            <p className="text-[#717171] mt-2">Commencez votre essai gratuit de 14 jours dès maintenant</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom complet</label>
              <input
                type="text"
                required
                className="border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
                placeholder="Jean Dupont"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[#222222] text-sm font-semibold mb-2 block">Email professionnel</label>
              <input
                type="email"
                required
                className="border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
                placeholder="vous@agence.fr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[#222222] text-sm font-semibold mb-2 block">Mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                className="border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
                placeholder="8 caractères minimum"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t border-[#DDDDDD]">
              <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom de votre structure</label>
              <input
                type="text"
                required
                className="border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
                placeholder="Slama Riviera"
                value={form.tenant_name}
                onChange={(e) =>
                  setForm({ ...form, tenant_name: e.target.value, tenant_slug: generateSlug(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-[#222222] text-sm font-semibold mb-2 block">
                Identifiant URL{" "}
                <span className="text-[#717171] font-normal">(généré automatiquement)</span>
              </label>
              <div className="flex items-center border border-[#DDDDDD] rounded-xl overflow-hidden focus-within:border-[#222222] focus-within:ring-2 focus-within:ring-[#222222]/10 transition-all">
                <span className="bg-[#F7F7F7] px-4 py-3 text-[#717171] text-sm border-r border-[#DDDDDD] flex-shrink-0">
                  hostpro.fr/
                </span>
                <input
                  type="text"
                  required
                  className="flex-1 px-4 py-3 text-sm text-[#222222] focus:outline-none"
                  value={form.tenant_slug}
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Création en cours..." : "Essai gratuit 14 jours — Créer mon compte"}
            </button>

            <p className="text-center text-xs text-[#717171]">
              Aucune carte bancaire requise. Annulez à tout moment.
            </p>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#DDDDDD]" />
            <span className="text-[#717171] text-sm">ou</span>
            <div className="flex-1 h-px bg-[#DDDDDD]" />
          </div>

          <p className="text-center text-sm text-[#717171]">
            Déjà un compte ?{" "}
            <a href="/login" className="text-[#222222] font-semibold hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

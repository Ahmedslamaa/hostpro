"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { LogoMark } from "@/components/ui/LogoMark";

export function LoginContent() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      const { access_token, refresh_token, user, tenant_id } = res.data;
      setAuth(user, access_token, refresh_token, tenant_id || "");
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <LogoMark variant="dark" size="xl" className="mb-3" />
            <div className="w-12 h-1 bg-white/40 rounded-full" />
          </div>

          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            La gestion locative saisonnière <em className="not-italic text-white/80">made simple</em>
          </h2>
          <p className="text-white/70 text-lg mb-10">
            La plateforme tout-en-un pour les professionnels de la location courte durée.
          </p>

          <div className="space-y-4">
            {[
              "Synchronisation automatique Airbnb, Booking.com & Abritel",
              "Conformité loi Le Meur avec alertes nuitées en temps réel",
              "Gestion d'équipe, tâches et messagerie centralisée",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-white/90 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoMark variant="light" size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Bienvenue</h1>
            <p className="text-neutral-500 mt-2">Connectez-vous à votre espace de gestion</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">
                Adresse email
              </label>
              <input
                type="email"
                required
                className="border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 w-full transition-all"
                placeholder="vous@exemple.fr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 w-full transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-primary-500 text-sm font-medium hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-neutral-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <p className="text-center text-sm text-neutral-500">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-neutral-900 font-semibold hover:underline">
              Créer un compte gratuit
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


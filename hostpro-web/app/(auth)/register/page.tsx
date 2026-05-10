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
    name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">H</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">HOST PRO</span>
          </div>
          <p className="text-slate-400 text-sm">Démarrez votre essai gratuit</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Créer votre compte</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Votre nom complet</label>
              <input
                type="text" required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Jean Dupont"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email professionnel</label>
              <input
                type="email" required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="vous@agence.fr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <input
                type="password" required minLength={8}
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="8 caractères minimum"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom de votre structure</label>
              <input
                type="text" required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Slama Riviera"
                value={form.tenant_name}
                onChange={(e) =>
                  setForm({ ...form, tenant_name: e.target.value, tenant_slug: generateSlug(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Identifiant URL <span className="text-slate-400 font-normal">(automatique)</span>
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <span className="bg-slate-50 px-3 py-2.5 text-slate-400 text-sm border-r border-slate-200">hostpro.fr/</span>
                <input
                  type="text" required
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                  value={form.tenant_slug}
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "Création..." : "Créer mon compte — Essai gratuit 14 jours"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà un compte ?{" "}
            <a href="/login" className="text-slate-900 font-medium hover:underline">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { LogoMark } from "@/components/ui/LogoMark";

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
      const { access_token, refresh_token, user, tenant_id } = res.data;
      setAuth(user, access_token, refresh_token, tenant_id || "");
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
    background: "white", fontFamily: "inherit", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  const Field = ({
    label, type = "text", value, onChange, placeholder, hint, required = true,
  }: {
    label: string; type?: string; value: string; onChange: (v: string) => void;
    placeholder?: string; hint?: string; required?: boolean;
  }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
          {label.toUpperCase()}
        </label>
        {hint && <span style={{ fontSize: 11, color: "#C00040" }}>{hint}</span>}
      </div>
      <input
        type={type} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "#E02060")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
      />
    </div>
  );

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      display: "grid", gridTemplateColumns: "1fr 1fr",
      background: "#F4F2F0",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: "#1A0E12",
      overflow: "hidden",
    }}>
      {/* ── Right — Visual (shown first visually on left) ── */}
      <div style={{
        background: "linear-gradient(155deg, #1A0E12 0%, #3A0F1F 50%, #C00040 110%)",
        position: "relative", overflow: "hidden",
        padding: 48, display: "flex", flexDirection: "column", justifyContent: "flex-end",
        color: "#F4F2F0",
        order: 1,
      }}>
        {/* Gold glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 30% 25%, rgba(224,192,128,0.35), transparent 55%)",
          pointerEvents: "none",
        }} />

        {/* Floating stats */}
        <div style={{
          position: "absolute", top: "14%", right: "10%", width: 220,
          background: "white", borderRadius: 14, padding: "14px 16px",
          transform: "rotate(3deg)",
          boxShadow: "0 16px 30px -12px rgba(0,0,0,0.3)",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#6B5A60" }}>ESSAI GRATUIT · 30 JOURS</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 24, color: "#1A0E12", marginTop: 4 }}>
            Aucune carte
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 12, color: "#6B5A60" }}>requise pour commencer</div>
        </div>

        <div style={{
          position: "absolute", top: "42%", left: "8%", width: 230,
          background: "white", borderRadius: 14, padding: "12px 14px",
          transform: "rotate(-2deg)",
          boxShadow: "0 16px 30px -12px rgba(0,0,0,0.25)",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#C00040" }}>✦ CONFIGURATION</div>
          <div style={{ fontSize: 12, color: "#1A0E12", marginTop: 4, lineHeight: 1.4 }}>
            Importez depuis Airbnb, Booking ou ICS en 5 minutes.
          </div>
        </div>

        <div style={{
          position: "absolute", top: "62%", right: "6%", width: 200,
          background: "white", borderRadius: 14, padding: "12px 14px",
          transform: "rotate(2deg)",
          boxShadow: "0 16px 30px -12px rgba(0,0,0,0.2)",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(140deg, #E0E0A0, #C0A060)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#1A0E12" }}>4.9</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A0E12" }}>Score hôte · IA</div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#C0A060" }}>↑ niveau Gold</div>
            </div>
          </div>
        </div>

        {/* Bottom copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#C0A060", letterSpacing: "0.2em" }}>★ REJOIGNEZ 4 800 HÔTES</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 44, margin: "10px 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Démarrez en<br />
            <span style={{ color: "#C0A060" }}>5 minutes</span>.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(244,242,240,0.8)", maxWidth: 400, margin: 0, lineHeight: 1.5 }}>
            11h économisées par semaine. Aucune carte bancaire pour commencer.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
            {["Aucune carte bancaire requise", "Configuration en 5 minutes", "Support dédié en français"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(244,242,240,0.9)" }}>
                <span style={{ color: "#C0A060", fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Left — Form ── */}
      <div style={{ padding: "48px 64px", display: "flex", flexDirection: "column", overflowY: "auto", order: 2 }}>
        <LogoMark as="link" href="/" variant="light" size="md" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, paddingTop: 32, paddingBottom: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#C00040", letterSpacing: "0.15em", marginBottom: 10 }}>
            BIENVENUE
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 40, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Démarrons.
          </h1>
          <p style={{ color: "#6B5A60", fontSize: 15, marginBottom: 28 }}>
            Créez votre compte et commencez votre essai gratuit de 30 jours.
          </p>

          {error && (
            <div style={{
              background: "rgba(192,0,64,0.06)", border: "1px solid rgba(192,0,64,0.2)",
              color: "#C00040", borderRadius: 10, padding: "10px 14px",
              fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field
              label="Nom complet"
              value={form.full_name}
              onChange={(v) => setForm({ ...form, full_name: v })}
              placeholder="Sofia Marchetti"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="vous@exemple.fr"
            />
            <Field
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="8 caractères minimum"
              hint="Min. 8 caractères"
            />

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14 }}>
              <Field
                label="Nom de votre structure"
                value={form.tenant_name}
                onChange={(v) => setForm({ ...form, tenant_name: v, tenant_slug: generateSlug(v) })}
                placeholder="Slama Riviera"
              />
            </div>

            <div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
                  IDENTIFIANT URL
                </label>
              </div>
              <div style={{
                display: "flex", alignItems: "center",
                border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, overflow: "hidden",
                background: "white",
              }}>
                <span style={{
                  background: "rgba(0,0,0,0.04)", padding: "12px 14px",
                  color: "#6B5A60", fontSize: 13, borderRight: "1px solid rgba(0,0,0,0.1)",
                  whiteSpace: "nowrap",
                }}>
                  hostpro.fr/
                </span>
                <input
                  type="text" required
                  value={form.tenant_slug}
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                  style={{ flex: 1, padding: "12px 14px", border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent" }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8,
                background: "#1A0E12", color: "#F4F2F0",
                border: "none", borderRadius: 12, padding: "14px 18px",
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? "Création en cours…" : "Essai gratuit 30 jours — Créer mon compte"}
              {!loading && <span style={{ color: "#C0A060" }}>→</span>}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#6B5A60" }}>
              Aucune carte bancaire requise. Annulez à tout moment.
            </p>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60" }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
          </div>

          <div style={{ marginTop: 4, fontSize: 13, color: "#6B5A60" }}>
            Déjà un compte ?{" "}
            <Link href="/login" style={{ color: "#C00040", fontWeight: 600, textDecoration: "underline" }}>
              Se connecter
            </Link>
          </div>
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
          © 2026 HOST PRO · CGU · CONFIDENTIALITÉ · HÉBERGÉ EN UE 🇪🇺
        </div>
      </div>
    </div>
  );
}

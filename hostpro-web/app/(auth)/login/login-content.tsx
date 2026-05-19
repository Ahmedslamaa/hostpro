"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  const FloatCard = ({
    top, left, tilt, width, children,
  }: {
    top: string; left: string; tilt: number; width: number; children: React.ReactNode;
  }) => (
    <div style={{
      position: "absolute", top, left, width,
      background: "#FFFFFF", borderRadius: 14, padding: "12px 14px",
      transform: `rotate(${tilt}deg)`,
      boxShadow: "0 16px 30px -12px rgba(0,0,0,0.25)",
      border: "1px solid rgba(0,0,0,0.04)",
    }}>{children}</div>
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
      {/* ── Left — Form ── */}
      <div style={{ padding: "48px 64px", display: "flex", flexDirection: "column" }}>
        <LogoMark as="link" href="/" variant="light" size="md" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#C00040", letterSpacing: "0.15em", marginBottom: 10 }}>
            RAVIE DE VOUS REVOIR
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 44, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Reprenons là où vous en êtes.
          </h1>
          <p style={{ color: "#6B5A60", fontSize: 15, marginBottom: 28 }}>
            Connectez-vous pour orchestrer vos logements, réservations et messages.
          </p>

          {error && (
            <div style={{
              background: "rgba(192,0,64,0.06)", border: "1px solid rgba(192,0,64,0.2)",
              color: "#C00040", borderRadius: 10, padding: "10px 14px",
              fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Email */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
                  EMAIL
                </label>
              </div>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.fr"
                style={{
                  width: "100%", padding: "12px 14px",
                  border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
                  background: "white", fontFamily: "inherit", fontSize: 14, outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#E02060")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
                  MOT DE PASSE
                </label>
                <a href="#" style={{ fontSize: 11, color: "#C00040", cursor: "pointer", fontWeight: 600, textDecoration: "none" }}>
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 14px",
                  border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
                  background: "white", fontFamily: "inherit", fontSize: 14, outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#E02060")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
              />
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
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Connexion…" : "Se connecter"}
              {!loading && <span style={{ color: "#C0A060" }}>→</span>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60" }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
          </div>

          {/* SSO buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {["Google", "Apple", "SSO"].map((label) => (
              <button key={label} style={{
                flex: 1, padding: "11px 14px",
                background: "white", border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                cursor: "pointer", color: "#1A0E12",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ marginTop: 28, fontSize: 13, color: "#6B5A60" }}>
            Nouveau ici ?{" "}
            <Link href="/register" style={{ color: "#C00040", fontWeight: 600, textDecoration: "underline" }}>
              Créer un compte
            </Link>
          </div>
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", letterSpacing: "0.1em" }}>
          © 2026 HOST PRO · CGU · CONFIDENTIALITÉ · HÉBERGÉ EN UE 🇪🇺
        </div>
      </div>

      {/* ── Right — Visual ── */}
      <div style={{
        background: "linear-gradient(155deg, #1A0E12 0%, #3A0F1F 50%, #C00040 110%)",
        position: "relative", overflow: "hidden",
        padding: 48, display: "flex", flexDirection: "column", justifyContent: "flex-end",
        color: "#F4F2F0",
      }}>
        {/* Gold radial glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 70% 25%, rgba(224,192,128,0.35), transparent 55%)",
          pointerEvents: "none",
        }} />

        {/* Floating card 1 — Occupation */}
        <FloatCard top="14%" left="12%" tilt={-3} width={240}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#6B5A60" }}>OCCUPATION · MAI</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", color: "#1A0E12" }}>87%</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 26, marginTop: 4 }}>
            {[40,55,62,50,70,68,82,76,88,84,90,87].map((v,i) => (
              <div key={i} style={{ flex: 1, height: `${v}%`, background: "#E02060", opacity: 0.4 + i*0.05, borderRadius: 2 }} />
            ))}
          </div>
        </FloatCard>

        {/* Floating card 2 — AI Insight */}
        <FloatCard top="38%" left="48%" tilt={3} width={220}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#C00040" }}>✦ AI INSIGHT</div>
          <div style={{ fontSize: 12, color: "#1A0E12", marginTop: 4, lineHeight: 1.35 }}>
            Réapprovisionner gel douche avant mercredi.
          </div>
        </FloatCard>

        {/* Floating card 3 — Arrival */}
        <FloatCard top="56%" left="10%" tilt={-2} width={200}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(140deg, #E0E0A0, #C0A060)" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A0E12" }}>Hugo Delcourt</div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: "#6B5A60" }}>arrive · 16:00</div>
            </div>
          </div>
        </FloatCard>

        {/* Bottom copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#C0A060", letterSpacing: "0.2em" }}>★ HOSPITALITY · OS</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 44, margin: "10px 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Tous vos outils,<br />
            <span style={{ color: "#C0A060" }}>une seule connexion</span>.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(244,242,240,0.8)", maxWidth: 420, margin: 0, lineHeight: 1.5 }}>
            Plus de tableurs, plus de SMS. 4 800 hôtes ont gagné 11h par semaine.
          </p>
        </div>
      </div>
    </div>
  );
}

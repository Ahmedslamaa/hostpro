"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { LogoMark } from "@/components/ui/LogoMark";

const DEMO_PLANS = [
  {
    id:       "starter",
    label:    "Starter",
    tagline:  "1–3 logements",
    color:    "#6B5A60",
    bg:       "rgba(107,90,96,0.07)",
    border:   "rgba(107,90,96,0.2)",
    features: ["Calendrier & réservations", "Messages unifiés", "1 utilisateur"],
    email:    "demo.starter@hostpro.fr",
    password: "Demo1234!",
  },
  {
    id:       "pro",
    label:    "Pro",
    tagline:  "4–20 logements",
    color:    "#C00040",
    bg:       "rgba(192,0,64,0.06)",
    border:   "rgba(192,0,64,0.25)",
    features: ["Tout Starter +", "AI Assistant", "5 utilisateurs", "Analytics"],
    email:    "demo.pro@hostpro.fr",
    password: "Demo1234!",
  },
  {
    id:       "enterprise",
    label:    "Enterprise",
    tagline:  "20+ logements",
    color:    "#C0A060",
    bg:       "rgba(192,160,96,0.08)",
    border:   "rgba(192,160,96,0.35)",
    features: ["Tout Pro +", "API access", "Utilisateurs illimités", "Support dédié"],
    email:    "demo.enterprise@hostpro.fr",
    password: "Demo1234!",
  },
] as const;

// Fallback : compte démo générique
const DEMO_EMAIL = "demo@hostpro.fr";
const DEMO_PASS  = "Demo1234!";

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  useEffect(() => {
    const demo = searchParams.get("demo");
    if (demo === "true") {
      setShowDemo(true);
      setForm({ email: DEMO_EMAIL, password: DEMO_PASS });
    }
    // ?plan=pro préselectionne directement un plan
    const planParam = searchParams.get("plan");
    if (planParam) {
      const found = DEMO_PLANS.find((p) => p.id === planParam);
      if (found) {
        setShowDemo(true);
        setActivePlan(found.id);
        setForm({ email: found.email, password: found.password });
      }
    }
  }, [searchParams]);

  const selectPlan = (plan: typeof DEMO_PLANS[number]) => {
    setActivePlan(plan.id);
    setShowDemo(true);
    setForm({ email: plan.email, password: plan.password });
    setError("");
  };

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

          {/* Demo banner */}
          {showDemo && (
            <div style={{
              background: "rgba(224,192,128,0.15)", border: "1px solid rgba(192,160,96,0.4)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 4,
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#C0A060", letterSpacing: "0.1em", fontWeight: 700 }}>
                MODE DÉMO — CREDENTIALS PRÉ-REMPLIS
              </div>
              <div style={{ fontSize: 12, color: "#6B5A60" }}>
                <span style={{ color: "#1A0E12", fontWeight: 600 }}>Email:</span> {DEMO_EMAIL} &nbsp;|&nbsp;
                <span style={{ color: "#1A0E12", fontWeight: 600 }}>Mot de passe:</span> {DEMO_PASS}
              </div>
            </div>
          )}

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

          {/* ── Accès démo par abonnement ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: "#6B5A60", whiteSpace: "nowrap" }}>
              ACCÈS DÉMO
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {DEMO_PLANS.map((plan) => {
              const isActive = activePlan === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    background: isActive ? plan.bg : "white",
                    border: `1.5px solid ${isActive ? plan.border : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s",
                    outline: "none",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                      width: 6, height: 6, borderRadius: "50%",
                      background: plan.color,
                    }} />
                  )}
                  <div style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                    color: isActive ? plan.color : "#6B5A60",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}>
                    {plan.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#1A0E12", fontWeight: 600 }}>
                    {plan.tagline}
                  </div>
                  <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{
                        fontSize: 10, color: "#6B5A60", lineHeight: 1.6,
                        display: "flex", alignItems: "baseline", gap: 4,
                      }}>
                        <span style={{ color: plan.color, fontSize: 8 }}>▸</span>{f}
                      </li>
                    ))}
                  </ul>
                  <div style={{
                    marginTop: 8,
                    padding: "5px 0",
                    background: isActive ? plan.color : "transparent",
                    border: `1px solid ${isActive ? plan.color : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 6,
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 9, fontWeight: 700,
                    color: isActive ? "white" : "#6B5A60",
                    textAlign: "center",
                    letterSpacing: "0.06em",
                    transition: "all 0.15s",
                  }}>
                    {isActive ? "✓ SÉLECTIONNÉ" : "TESTER"}
                  </div>
                </button>
              );
            })}
          </div>

          {showDemo && activePlan && (() => {
            const plan = DEMO_PLANS.find((p) => p.id === activePlan);
            if (!plan) return null;
            return (
              <div style={{
                marginTop: 10,
                background: plan.bg,
                border: `1px solid ${plan.border}`,
                borderRadius: 8, padding: "8px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: plan.color, fontWeight: 700, letterSpacing: "0.1em" }}>
                    COMPTE DÉMO {plan.label.toUpperCase()} PRÉ-REMPLI
                  </span>
                  <div style={{ fontSize: 11, color: "#6B5A60", marginTop: 2 }}>
                    <span style={{ color: "#1A0E12", fontWeight: 600 }}>{plan.email}</span>
                    {" · "}
                    <span style={{ color: "#1A0E12", fontWeight: 600 }}>{plan.password}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setActivePlan(null); setShowDemo(false); setForm({ email: "", password: "" }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5A60", fontSize: 16, lineHeight: 1, padding: 4 }}
                  aria-label="Fermer"
                >×</button>
              </div>
            );
          })()}

          <div style={{ marginTop: 20, fontSize: 13, color: "#6B5A60" }}>
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

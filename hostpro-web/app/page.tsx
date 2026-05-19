"use client";
import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

/* ── Design tokens ── */
const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const ROSE_DEEP = "#C00040";
const GOLD = "#E0C080";
const GOLD_DEEP = "#C0A060";
const PAPER = "#F4F2F0";
const BG = "#E0E0E0";

const mktBtnPrimary: React.CSSProperties = {
  background: ROSE, color: "white",
  border: "none", borderRadius: 99, padding: "10px 20px",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  boxShadow: "0 8px 20px -8px rgba(224,32,96,0.5)",
  textDecoration: "none", display: "inline-block",
};
const mktBtnGhost: React.CSSProperties = {
  background: "transparent", color: INK,
  border: `1px solid rgba(0,0,0,0.15)`, borderRadius: 99,
  padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  textDecoration: "none", display: "inline-block",
};

function MktStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", color: INK }}>{n}</div>
      <div style={{ fontSize: 12, color: INK_SOFT }}>{l}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99,
        background: "rgba(224,32,96,0.1)", color: ROSE_DEEP,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 12, fontWeight: 700, marginTop: 1,
      }}>✓</div>
      <span style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Combien de temps pour démarrer ?", a: "5 minutes. Importez vos logements depuis Airbnb, Booking ou un ICS, et vous êtes en ligne." },
    { q: "Mes données sont-elles en sécurité ?", a: "Oui, hébergement Europe, chiffrement AES-256, conforme RGPD." },
    { q: "Est-ce que ça remplace Airbnb ?", a: "Non, c'est complémentaire. Host Pro gère le back-office, Airbnb reste votre canal de réservation." },
    { q: "Puis-je essayer avant de payer ?", a: "Bien sûr. 30 jours gratuits sur le plan Pro, sans carte bancaire requise." },
    { q: "Comment fonctionne la conformité loi Le Meur ?", a: "HOSTPRO gère automatiquement les numéros d'enregistrement, les déclarations en mairie et le suivi des plafonds de nuitées." },
  ];

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: PAPER, color: INK,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "22px 56px",
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(244,242,240,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}>
        <LogoMark as="link" href="/" variant="light" size="md" />
        <div style={{ display: "flex", gap: 32, fontSize: 14 }}>
          {[["Plateforme","#fonctionnalites"],["Tarifs","#tarifs"],["Avis","#avis"],["FAQ","#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ color: INK, fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ ...mktBtnGhost, padding: "9px 18px" }}>Se connecter</Link>
          <Link href="/register" style={{ ...mktBtnPrimary, padding: "9px 18px" }}>Démarrer gratuitement</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "72px 56px 40px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center", maxWidth: 1280, margin: "0 auto" }}>
        <div>
          {/* Pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 99,
            background: "rgba(224,32,96,0.08)", color: ROSE_DEEP,
            fontSize: 13, fontWeight: 500, marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: ROSE, display: "inline-block" }} />
            Nouveau · co-pilote IA pour hôtes
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(48px,5vw,80px)", lineHeight: 0.95, margin: "0 0 22px", letterSpacing: "-0.035em" }}>
            Gérez vos locations<br />
            <span style={{ color: GOLD_DEEP }}>saisonnières</span> sans effort.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: INK_SOFT, maxWidth: 540, margin: 0 }}>
            Stocks, ménages, commandes, messages, prix : Host Pro orchestre tout, et son IA fait le reste. 4 800 hôtes, 11h gagnées par semaine.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/register" style={{ ...mktBtnPrimary, padding: "14px 24px", fontSize: 15 }}>Démarrer gratuitement →</Link>
            <a href="#fonctionnalites" style={{ ...mktBtnGhost, padding: "14px 24px", fontSize: 15 }}>Voir la démo · 2 min</a>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 40, alignItems: "center", flexWrap: "wrap" }}>
            <MktStat n="4 800+" l="hôtes connectés" />
            <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.1)" }} />
            <MktStat n="98 %" l="check-in à l'heure" />
            <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.1)" }} />
            <MktStat n="11h" l="économisées / semaine" />
          </div>
        </div>

        {/* Right — Dashboard visual */}
        <div style={{ position: "relative", aspectRatio: "4/5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "absolute", inset: "6% 4%",
            borderRadius: 32,
            background: "linear-gradient(150deg, #E02060 0%, #C00040 60%, #1A0E12 110%)",
            boxShadow: "0 40px 80px -20px rgba(192,0,64,0.45)",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(224,192,128,0.3), transparent 50%)" }} />
            <div style={{ position: "absolute", top: 22, left: 24, display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.8)" }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: GOLD }} />
              <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, letterSpacing: "0.12em" }}>DASHBOARD · LIVE</span>
            </div>

            {/* Float 1 */}
            <div style={{ position: "absolute", top: "18%", left: "8%", width: 190, background: "#fff", borderRadius: 14, padding: "12px 14px", transform: "rotate(-4deg)", boxShadow: "0 16px 30px -12px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>OCCUPATION · MAI</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 32, color: INK }}>87%</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 26, marginTop: 4 }}>
                {[40,55,62,50,70,68,82,76,88,84,90,87].map((v,i) => (
                  <div key={i} style={{ flex: 1, height: `${v}%`, background: ROSE, opacity: 0.5 + i*0.04, borderRadius: 2 }} />
                ))}
              </div>
            </div>

            {/* Float 2 */}
            <div style={{ position: "absolute", top: "46%", left: "38%", width: 220, background: "#fff", borderRadius: 14, padding: "12px 14px", transform: "rotate(3deg)", boxShadow: "0 16px 30px -12px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: ROSE }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Stock — Serviettes</div>
                  <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>42 disponibles · ↓ 6</div>
                </div>
              </div>
            </div>

            {/* Float 3 */}
            <div style={{ position: "absolute", top: "68%", left: "10%", width: 240, background: "#fff", borderRadius: 14, padding: "12px 14px", transform: "rotate(-2deg)", boxShadow: "0 16px 30px -12px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: ROSE_DEEP }}>✦ AI SUGGESTION</div>
              <div style={{ fontSize: 13, color: INK, marginTop: 4, lineHeight: 1.35 }}>
                Réapprovisionner café Loft Bastille avant samedi.
              </div>
            </div>
          </div>

          {/* Logo floating card */}
          <div style={{
            position: "absolute", top: "-2%", right: "-4%",
            background: "#FFFFFF", padding: "14px 22px", borderRadius: 16,
            transform: "rotate(-6deg)",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}>
            <LogoMark variant="light" size="sm" />
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: INK_SOFT, marginTop: 4, letterSpacing: "0.1em" }}>HOSPITALITY · OS</div>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS STRIP ── */}
      <section style={{ padding: "12px 56px 56px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 24,
          background: "rgba(26,14,18,0.04)", borderRadius: 16,
          padding: "14px 24px",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: INK_SOFT, whiteSpace: "nowrap", letterSpacing: "0.1em" }}>
            HOST PRO S'INTÈGRE AUX APPLICATIONS
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.12)", flexShrink: 0 }} />
          {["Airbnb", "Booking", "Vrbo"].map((name, i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {i > 0 && <div style={{ width: 4, height: 4, borderRadius: 99, background: "rgba(0,0,0,0.2)" }} />}
              <span style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 800, fontSize: 15,
                color: INK,
                letterSpacing: "-0.02em",
              }}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" style={{ padding: "72px 56px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(36px,4vw,56px)", margin: 0, letterSpacing: "-0.03em", maxWidth: 760 }}>
            Tout ce qu'un hôte gère,{" "}
            <span style={{ color: GOLD_DEEP }}>en un endroit</span>.
          </h2>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: INK_SOFT }}>04 MODULES · 1 PLATEFORME</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { i: "◐", tag: "STOCKS", t: "Inventaire vivant", d: "Linge, savons, café, kits welcome. Décompte automatique à chaque check-out.", accent: ROSE },
            { i: "✦", tag: "IA", t: "Co-pilote prédictif", d: "Prévoit les ruptures, suggère les commandes, rédige les messages d'arrivée.", accent: GOLD_DEEP },
            { i: "◇", tag: "COMMANDES", t: "Scanner & re-stock", d: "Scan QR sur le terrain, panier automatique, validation en un swipe.", accent: ROSE_DEEP },
            { i: "◉", tag: "ÉQUIPE", t: "Équipiers synchronisés", d: "Ménage, conciergerie, maintenance. Une chronologie unique, zéro SMS.", accent: "#E04060" },
          ].map((f) => (
            <div key={f.tag} style={{
              background: "#FFFFFF", borderRadius: 22, padding: 24,
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex", flexDirection: "column", gap: 14, minHeight: 240,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: f.accent, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{f.i}</div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: f.accent, letterSpacing: "0.15em" }}>{f.tag}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em" }}>{f.t}</div>
              <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>

        {/* Feature detail */}
        <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: ROSE_DEEP, letterSpacing: "0.15em" }}>★ FEATURE FOCUS</div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 44, margin: "10px 0 14px", letterSpacing: "-0.03em", lineHeight: 1 }}>
              Vos stocks comptent,<br />
              <span style={{ color: GOLD_DEEP }}>littéralement</span>.
            </h3>
            <p style={{ fontSize: 16, color: INK_SOFT, lineHeight: 1.5, maxWidth: 500, margin: 0 }}>
              Posez un QR code dans chaque placard. À chaque ménage, votre équipe scanne ce qui sort. Host Pro met à jour les stocks en temps réel et déclenche les commandes avant que vous ne manquiez de rien.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
              <Bullet>QR codes imprimables · 30 secondes</Bullet>
              <Bullet>Catalogues B2B intégrés (Linéa, Nespresso, …)</Bullet>
              <Bullet>Seuils personnalisables par article et logement</Bullet>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 22, border: "1px solid rgba(0,0,0,0.06)", padding: 22, boxShadow: "0 24px 50px -20px rgba(0,0,0,0.12)" }}>
            {[
              { name: "Gel douche · 200ml", status: "critical", qty: 4, min: 12 },
              { name: "Café dosettes x50", status: "low", qty: 8, min: 20 },
              { name: "Serviettes bain", status: "ok", qty: 42, min: 24 },
              { name: "Kit bienvenue", status: "critical", qty: 2, min: 10 },
              { name: "Linge de lit", status: "ok", qty: 16, min: 12 },
            ].map((s, idx) => {
              const isLast = idx === 4;
              const color = s.status === "critical" ? ROSE_DEEP : s.status === "low" ? GOLD_DEEP : "#1B7A4A";
              const label = s.status === "critical" ? "CRITIQUE" : s.status === "low" ? "FAIBLE" : "OK";
              const pct = Math.min(100, (s.qty / (s.min * 2)) * 100);
              return (
                <div key={s.name} style={{
                  display: "grid", gridTemplateColumns: "1.6fr 80px 80px",
                  gap: 10, padding: "10px 0", alignItems: "center",
                  borderBottom: !isLast ? "1px dashed rgba(0,0,0,0.08)" : "none",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: `${color}18`, color, padding: "4px 8px", borderRadius: 99, textAlign: "center" }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="avis" style={{ padding: "72px 56px", background: BG }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: ROSE_DEEP, letterSpacing: "0.15em" }}>★ TÉMOIGNAGES</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", margin: "10px 0 32px", letterSpacing: "-0.03em" }}>
            Des hôtes qui dorment <span style={{ color: GOLD_DEEP }}>mieux</span>.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {[
              { q: "Host Pro a remplacé 4 outils. Mes ménagères scannent, mon stock se commande tout seul.", n: "Léa Doré", r: "3 appartements · Bordeaux", featured: false },
              { q: "Le co-pilote IA rédige mes messages mieux que moi. Mes notes invités ont grimpé à 4.9.", n: "Tomás Esquivel", r: "5 logements · Lisbonne", featured: true },
              { q: "11h par semaine de moins sur l'admin. C'est un week-end en plus chaque mois.", n: "Amélie Vasseur", r: "2 chalets · Annecy", featured: false },
            ].map((t, i) => (
              <div key={i} style={{
                background: t.featured ? "linear-gradient(155deg, #1A0E12 0%, #3A0F1F 60%, #C00040 130%)" : "white",
                color: t.featured ? "#F4F2F0" : INK,
                borderRadius: 20, padding: 24,
                border: t.featured ? "none" : "1px solid rgba(0,0,0,0.06)",
                display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.25, flex: 1, color: t.featured ? GOLD : INK }}>"{t.q}"</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 99,
                    background: t.featured ? GOLD : "linear-gradient(140deg, #E04060, #C00040)",
                    color: t.featured ? INK : "white",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13,
                  }}>{t.n.split(" ").map((x) => x[0]).join("")}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{t.n}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, opacity: 0.6 }}>{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: ROSE, letterSpacing: "0.15em" }}>TARIFS</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(36px,4vw,56px)", margin: "10px 0 8px", letterSpacing: "-0.03em" }}>
              Simple, comme l'hospitalité.
            </h2>
            <p style={{ color: INK_SOFT, fontSize: 17, margin: 0 }}>Sans engagement · annulation en 1 clic</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 1100, margin: "0 auto" }}>
            {[
              { name: "Solo", price: "19", tagline: "1 logement", featured: false,
                features: ["Stocks illimités", "Co-pilote IA basique", "Application mobile", "Support email"] },
              { name: "Pro", price: "49", tagline: "2 à 10 logements", featured: true,
                features: ["Tout Solo +", "Équipe & permissions", "IA prédictive complète", "Intégrations PMS", "Support prioritaire"] },
              { name: "Studio", price: "Sur mesure", tagline: "11 logements et +", featured: false,
                features: ["Tout Pro +", "Multi-marques", "API & webhooks", "Customer success dédié"] },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: plan.featured ? INK : "#FFFFFF",
                color: plan.featured ? "#F4F2F0" : INK,
                borderRadius: 24, padding: 32,
                border: plan.featured ? "none" : "1px solid rgba(0,0,0,0.06)",
                position: "relative",
                boxShadow: plan.featured ? "0 30px 60px -20px rgba(192,0,64,0.35)" : "none",
              }}>
                {plan.featured && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    background: GOLD, color: INK,
                    fontSize: 10, padding: "4px 10px", borderRadius: 99, fontWeight: 800, letterSpacing: "0.1em",
                  }}>POPULAIRE</div>
                )}
                <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 22 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: plan.featured ? "rgba(244,242,240,0.6)" : INK_SOFT, marginBottom: 16 }}>{plan.tagline}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 56, letterSpacing: "-0.03em" }}>
                    {plan.price === "Sur mesure" ? plan.price : `${plan.price}€`}
                  </span>
                  {plan.price !== "Sur mesure" && <span style={{ fontSize: 14, color: plan.featured ? "rgba(244,242,240,0.6)" : INK_SOFT }}>/mois</span>}
                </div>
                <Link href="/register" style={{
                  display: "block", width: "100%", textAlign: "center",
                  background: plan.featured ? GOLD : ROSE,
                  color: plan.featured ? INK : "white",
                  border: "none", borderRadius: 99, padding: "12px 18px",
                  marginBottom: 20, fontWeight: 700, fontSize: 14, textDecoration: "none",
                }}>Choisir {plan.name}</Link>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ fontSize: 13, display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: plan.featured ? GOLD : ROSE }}>✓</span>
                      <span style={{ color: plan.featured ? "rgba(244,242,240,0.85)" : INK }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "72px 56px", background: BG }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 56, maxWidth: 1100, margin: "0 auto" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: ROSE_DEEP, letterSpacing: "0.15em" }}>FAQ</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 44, margin: "10px 0 14px", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              Tout ce que vous vous demandez.
            </h2>
            <p style={{ color: INK_SOFT, fontSize: 15 }}>
              Une question sans réponse ? Notre équipe vous répond en moins d'1h.
            </p>
          </div>
          <div>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.1)", padding: "16px 0" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: "inherit", textAlign: "left", padding: 0,
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{f.q}</span>
                  <span style={{ color: ROSE_DEEP, fontSize: 20, flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.6, marginTop: 10 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "32px 56px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(120deg, #1A0E12 0%, #3A1020 60%, #C00040 110%)",
            borderRadius: 32, padding: "64px 56px",
            color: "#F4F2F0",
            display: "grid", gridTemplateColumns: "1.5fr 1fr",
            gap: 40, alignItems: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", background: "radial-gradient(circle at 70% 50%, rgba(224,192,128,0.3), transparent 60%)" }} />
            <div style={{ position: "absolute", right: -20, top: 30, opacity: 0.06, pointerEvents: "none", transform: "rotate(-8deg)" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 260, letterSpacing: "-0.05em", color: "#F4E4B0", lineHeight: 0.8 }}>Pro</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: GOLD, letterSpacing: "0.15em" }}>PRÊT À ACCUEILLIR ?</div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 56, margin: "12px 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Recevez vos invités<br />
                <span style={{ color: GOLD }}>comme un pro</span>.
              </h2>
              <p style={{ fontSize: 17, color: "rgba(244,242,240,0.8)", margin: 0, maxWidth: 480 }}>
                Démarrez en 5 minutes. Importez vos logements depuis Airbnb, Booking, ou un calendrier ICS.
              </p>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href="/register" style={{ ...mktBtnPrimary, background: GOLD, color: INK, padding: "16px 22px", fontSize: 16, textAlign: "center" }}>
                Créer mon compte →
              </Link>
              <a href="#" style={{ ...mktBtnGhost, color: "#F4F2F0", borderColor: "rgba(255,255,255,0.3)", padding: "16px 22px", fontSize: 16, textAlign: "center" }}>
                Parler à un humain
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "32px 56px 40px", borderTop: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 32 }}>
            <div>
              <LogoMark variant="light" size="md" />
              <p style={{ fontSize: 12, color: INK_SOFT, marginTop: 14, maxWidth: 260, lineHeight: 1.5 }}>
                Le système d'exploitation des hôtes professionnels. Stocks, IA, équipe, en une seule connexion.
              </p>
            </div>
            {[
              { title: "Plateforme", links: ["Dashboard", "Stocks", "Co-pilote IA", "App mobile", "API"] },
              { title: "Pour qui", links: ["Hôtes solo", "Multi-logements", "Conciergerie", "Property managers", "Hôtels boutique"] },
              { title: "Ressources", links: ["Documentation", "Blog", "Cas clients", "Statut", "Changelog"] },
              { title: "Entreprise", links: ["À propos", "Carrières", "Contact", "Presse", "CGU & vie privée"] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em", marginBottom: 12 }}>{col.title.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l) => <a key={l} href="#" style={{ color: INK, fontWeight: 500, textDecoration: "none", fontSize: 13 }}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: INK_SOFT, paddingTop: 18, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11 }}>© 2026 HOST PRO · MADE WITH ✦ IN PARIS</div>
            <div style={{ display: "flex", gap: 18, fontSize: 12 }}>
              {["Mentions légales", "Politique de confidentialité", "Cookies"].map((l) => (
                <a key={l} href="#" style={{ color: INK_SOFT, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

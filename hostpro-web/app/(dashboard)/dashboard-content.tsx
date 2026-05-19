"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/lib/api";
import { formatCurrency, formatDateShort, sourceLabel } from "@/lib/utils";
import { Home, Calendar, Plus, Sparkles, Zap, BarChart2, ChevronRight, AlertTriangle } from "lucide-react";

/* ── Design tokens ── */
const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const ROSE_DEEP = "#C00040";
const GOLD = "#E0C080";
const GOLD_DEEP = "#C0A060";
const PAPER = "#F4F2F0";
const BG = "#E0E0E0";

interface KPIs {
  occupancy_rate: number;
  total_revenue: number;
  adr: number;
  revpar: number;
  total_reservations: number;
  active_properties: number;
  period: string;
}

const SOURCE_BADGE: Record<string, { bg: string; color: string }> = {
  airbnb:  { bg: "rgba(255,90,95,0.1)",  color: "#FF5A5F" },
  booking: { bg: "rgba(0,100,200,0.1)",  color: "#0064C8" },
  manual:  { bg: "rgba(224,32,96,0.1)",  color: ROSE_DEEP },
  direct:  { bg: "rgba(224,32,96,0.1)",  color: ROSE_DEEP },
  abritel: { bg: "rgba(0,180,170,0.1)",  color: "#00B4AA" },
};

const ONBOARDING_STEPS = [
  { id: "property", label: "Ajouter une propriété", desc: "Créez votre premier bien locatif", href: "/properties", icon: Home },
  { id: "platform", label: "Connecter une plateforme", desc: "Synchronisez Airbnb, Booking.com…", href: "/settings", icon: Calendar },
  { id: "pricing", label: "Activer la tarification IA", desc: "Optimisez vos prix automatiquement", href: "/pricing", icon: Sparkles },
  { id: "automation", label: "Configurer l'automatisation", desc: "Check-in, ménage, messages auto", href: "/automation", icon: Zap },
];

function EmptyDashboard() {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: ROSE_DEEP, letterSpacing: "0.15em", marginBottom: 12 }}>BIENVENUE SUR HOST PRO</div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 40, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Commençons par votre premier logement.
      </h2>
      <p style={{ color: INK_SOFT, maxWidth: 440, fontSize: 15, marginBottom: 36, lineHeight: 1.5 }}>
        Votre tableau de bord sera prêt dès que vous aurez ajouté une propriété.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, width: "100%", maxWidth: 560, marginBottom: 28 }}>
        {ONBOARDING_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => router.push(s.href)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: "white", border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 16, padding: 18, cursor: "pointer",
              fontFamily: "inherit", textAlign: "left",
              transition: "box-shadow 0.2s",
            }}
          >
            <div style={{ width: 40, height: 40, background: "rgba(224,32,96,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={18} color={ROSE_DEEP} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: INK_SOFT, marginBottom: 2 }}>0{i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: INK_SOFT }}>{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/properties")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: INK, color: "#F4F2F0",
          border: "none", borderRadius: 12, padding: "14px 22px",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <Plus size={16} /> Ajouter ma première propriété <span style={{ color: GOLD_DEEP }}>→</span>
      </button>
    </div>
  );
}

function DashKPI({ label, value, delta, deltaPos, gold, warning, children }: {
  label: string; value: string | number; delta: string;
  deltaPos?: boolean; gold?: boolean; warning?: boolean;
  children?: React.ReactNode;
}) {
  const deltaColor = gold ? GOLD_DEEP : (warning ? ROSE_DEEP : (deltaPos ? "#1B7A4A" : ROSE_DEEP));
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 16, border: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT, letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em" }}>{value}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{warning ? "!" : "↑"} {delta}</span>
      </div>
      {children}
    </div>
  );
}

function DashBars({ data }: { data: number[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32, marginTop: 6 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${v}%`, background: ROSE,
          opacity: i === data.length - 1 ? 1 : 0.3 + 0.05 * i,
          borderRadius: 2,
        }} />
      ))}
    </div>
  );
}

function DashSpark() {
  return (
    <svg width="100%" height="36" viewBox="0 0 160 36" style={{ marginTop: 6 }}>
      <polyline points="0,28 20,24 40,26 60,16 80,18 100,10 120,12 140,6 160,4"
        fill="none" stroke={ROSE_DEEP} strokeWidth="2" strokeLinecap="round" />
      <polyline points="0,28 20,24 40,26 60,16 80,18 100,10 120,12 140,6 160,4 160,36 0,36"
        fill={ROSE_DEEP} opacity="0.1" />
      <circle cx="160" cy="4" r="3" fill={ROSE_DEEP} />
    </svg>
  );
}

function DashCard({ title, sub, action, children }: {
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 18, border: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</div>
          {sub && <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [k, u, a, r] = await Promise.all([
          fetch(`/api/v1/dashboard/kpis?period=${period}`).then(res => res.json()).catch(() => null),
          fetch("/api/v1/dashboard/upcoming?days=14").then(res => res.json()).catch(() => []),
          fetch("/api/v1/dashboard/alerts").then(res => res.json()).catch(() => []),
          fetch("/api/v1/dashboard/revenue?months=6").then(res => res.json()).catch(() => []),
        ]);
        setKpis(k as KPIs);
        setUpcoming(Array.isArray(u) ? u : []);
        setAlerts(Array.isArray(a) ? a : []);
        setRevenue(Array.isArray(r) ? r : []);
      } catch {
        setKpis(null); setUpcoming([]); setAlerts([]); setRevenue([]);
      }
      setLoading(false);
    };
    load();
  }, [period]);

  if (!loading && kpis && kpis.active_properties === 0) {
    return <EmptyDashboard />;
  }

  const PERIOD_LABELS: Record<string, string> = { month: "Ce mois", quarter: "Trimestre", year: "Cette année" };

  const occ = kpis?.occupancy_rate ?? 0;
  const rev = (kpis as any)?.total_revenue ?? (kpis as any)?.revenue ?? 0;
  const adr = (kpis as any)?.adr ?? (kpis as any)?.avg_price_per_night ?? 0;
  const revpar = (kpis as any)?.revpar ?? (kpis as any)?.rev_par ?? 0;
  const totalRes = kpis?.total_reservations ?? 0;
  const activeProps = kpis?.active_properties ?? 0;

  return (
    <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Greeting + period ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 32, margin: "4px 0 0", letterSpacing: "-0.025em" }}>
            Tableau de bord{" "}
            <span style={{ color: GOLD_DEEP }}>
              {activeProps > 0 ? `${activeProps} logement${activeProps > 1 ? "s" : ""}` : ""}
            </span>
          </h1>
        </div>
        {/* Period selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 3 }}>
          {(["month", "quarter", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                background: period === p ? INK : "transparent",
                color: period === p ? "#F4F2F0" : INK_SOFT,
                transition: "all 0.15s",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10, fontSize: 13,
              background: a.severity === "critical" ? "rgba(192,0,64,0.06)" : "rgba(224,192,128,0.15)",
              border: `1px solid ${a.severity === "critical" ? "rgba(192,0,64,0.2)" : "rgba(192,160,96,0.3)"}`,
              color: a.severity === "critical" ? ROSE_DEEP : "#C0A060",
            }}>
              <AlertTriangle size={14} />
              <span><strong>{a.property_name}</strong> — {a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Row ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, height: 110, border: "1px solid rgba(0,0,0,0.05)", opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <DashKPI label="OCCUPATION · 30J" value={`${occ}%`} delta="+4.2" deltaPos>
            <DashBars data={[40,55,62,50,70,68,82,76,88,84,90,occ]} />
          </DashKPI>
          <DashKPI label="REVENU · MTD" value={formatCurrency(rev)} delta="+12.8" deltaPos>
            <DashSpark />
          </DashKPI>
          <DashKPI label="PRIX MOYEN / NUIT" value={formatCurrency(adr)} delta="+5.8" deltaPos>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {[1,2,3,4,5].map((i) => (
                <span key={i} style={{ color: i <= 4 ? GOLD_DEEP : "rgba(0,0,0,0.15)", fontSize: 14 }}>★</span>
              ))}
            </div>
          </DashKPI>
          <DashKPI label="RÉSERVATIONS" value={totalRes} delta={`${activeProps} actifs`} gold>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <div style={{ flex: 1, height: 22, borderRadius: 6, background: ROSE_DEEP, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>{totalRes}</div>
            </div>
          </DashKPI>
        </div>
      )}

      {/* ── Main two-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Revenue chart */}
          <DashCard
            title="Revenus sur 6 mois"
            sub="Évolution mensuelle en euros"
            action={
              <button onClick={() => router.push("/analytics")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: ROSE_DEEP, letterSpacing: "0.05em" }}>
                Analytics →
              </button>
            }
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(6)].map((_, i) => <div key={i} style={{ height: 20, background: PAPER, borderRadius: 99 }} />)}
              </div>
            ) : revenue.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {revenue.map((r, i) => {
                  const max = Math.max(...revenue.map((x) => x.revenue));
                  const pct = max > 0 ? (r.revenue / max) * 100 : 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT, width: 48, flexShrink: 0 }}>{r.month}</span>
                      <div style={{ flex: 1, background: "rgba(0,0,0,0.06)", borderRadius: 99, height: 8 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: ROSE, borderRadius: 99, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, fontWeight: 700, color: INK, width: 72, textAlign: "right" }}>
                        {formatCurrency(r.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: INK_SOFT, fontSize: 14 }}>
                Aucune donnée disponible
              </div>
            )}
          </DashCard>

          {/* Upcoming arrivals */}
          <DashCard
            title="Arrivées à venir"
            sub="14 prochains jours"
            action={
              <button onClick={() => router.push("/reservations")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: ROSE_DEEP, letterSpacing: "0.05em" }}>
                Tout voir →
              </button>
            }
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(4)].map((_, i) => <div key={i} style={{ height: 52, background: PAPER, borderRadius: 10 }} />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 100, color: INK_SOFT, gap: 8 }}>
                <Calendar size={28} color="rgba(0,0,0,0.15)" />
                <p style={{ fontSize: 13, margin: 0 }}>Aucune arrivée prévue</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.slice(0, 5).map((r, i) => {
                  const src = SOURCE_BADGE[r.source] || { bg: "rgba(0,0,0,0.06)", color: INK_SOFT };
                  return (
                    <div key={r.reservation_id || i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 10, background: PAPER,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 99,
                        background: "linear-gradient(140deg, #E0E0A0, #C0A060)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 12, color: INK, flexShrink: 0,
                      }}>{(r.guest_name || "G")[0].toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.guest_name || "Voyageur"} — {r.property_name}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>
                          {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)} · {r.nights}n
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                        background: src.bg, color: src.color,
                        padding: "4px 8px", borderRadius: 99, flexShrink: 0,
                      }}>{sourceLabel(r.source)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </DashCard>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* AI Co-pilot card */}
          <div style={{
            background: "linear-gradient(155deg, #1A0E12 0%, #3A0F1F 60%, #C00040 130%)",
            borderRadius: 18, padding: 18, color: "#F4F2F0",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(224,192,128,0.2), transparent 55%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: GOLD, color: INK,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                }}>✦</div>
                <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.15em", color: GOLD }}>CO-PILOTE IA</div>
              </div>
              <button
                onClick={() => router.push("/assistant")}
                style={{
                  background: "rgba(244,228,176,0.15)", color: GOLD,
                  border: "1px solid rgba(244,228,176,0.3)", borderRadius: 8,
                  padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >Ouvrir →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { emoji: "◇", t: "Réapprovisionner gel douche", d: "Rupture probable mercredi. Panier prêt · 24u.", cta: "Valider" },
                { emoji: "◐", t: "Augmenter prix du week-end", d: "Demande +27%. Marge sûre.", cta: "Appliquer" },
                { emoji: "◑", t: "Message d'arrivée à préparer", d: "Ton chaleureux, mention services.", cta: "Rédiger" },
              ].map((ins) => (
                <div key={ins.t} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(244,228,176,0.18)",
                  borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <div style={{ fontSize: 16, color: GOLD }}>{ins.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ins.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(244,242,240,0.65)" }}>{ins.d}</div>
                  </div>
                  <button style={{
                    background: GOLD, color: INK,
                    border: "none", borderRadius: 8, padding: "5px 10px",
                    fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                  }}>{ins.cta}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <DashCard title="Actions rapides" sub="Raccourcis vers vos outils">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Réservations", href: "/reservations", icon: Calendar },
                { label: "Propriétés", href: "/properties", icon: Home },
                { label: "Analytics", href: "/analytics", icon: BarChart2 },
                { label: "Assistant IA", href: "/assistant", icon: Sparkles },
              ].map((a) => (
                <button
                  key={a.href}
                  onClick={() => router.push(a.href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 12px", background: PAPER,
                    border: "none", borderRadius: 10, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: INK,
                    transition: "background 0.15s",
                  }}
                >
                  <a.icon size={14} color={ROSE_DEEP} />
                  {a.label}
                </button>
              ))}
            </div>
          </DashCard>

          {/* Properties count */}
          {!loading && (
            <DashCard title="Mes logements" sub={`${activeProps} actifs`} action={
              <button onClick={() => router.push("/properties")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: ROSE_DEEP }}>
                Tout voir →
              </button>
            }>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "8px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 40, color: INK, letterSpacing: "-0.02em" }}>{activeProps}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>LOGEMENTS</div>
                </div>
                <div style={{ width: 1, height: 48, background: "rgba(0,0,0,0.08)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 40, color: ROSE_DEEP, letterSpacing: "-0.02em" }}>{occ}%</div>
                  <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10, color: INK_SOFT }}>OCCUPATION</div>
                </div>
              </div>
            </DashCard>
          )}
        </div>
      </div>
    </div>
  );
}

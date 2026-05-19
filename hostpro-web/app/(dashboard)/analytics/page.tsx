"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Home, Calendar, Euro, Moon, BarChart2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

const PERIODS = ["Ce mois", "3 mois", "Cette année"] as const;
type Period = typeof PERIODS[number];

const PERIOD_MAP: Record<Period, string> = {
  "Ce mois": "month",
  "3 mois":  "quarter",
  "Cette année": "year",
};

function KpiCard({ label, value, sub, icon: Icon, up }: { label: string; value: string | number; sub?: string; icon: any; up?: boolean }) {
  return (
    <div style={{
      background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
      padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div className="flex items-start justify-between mb-3">
        <div style={{
          width: 40, height: 40, background: "rgba(224,32,96,0.08)", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} style={{ color: ROSE }} />
        </div>
        {up !== undefined && (
          <span style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
            padding: "4px 8px", borderRadius: 99,
            background: up ? "rgba(27,122,74,0.1)" : "rgba(192,0,64,0.1)",
            color: up ? "#1B7A4A" : "#C00040",
          }}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 26, fontWeight: 800, color: INK, marginBottom: 2,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>{value}</div>
      <div style={{ fontSize: 13, color: INK_SOFT }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(0,0,0,0.25)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod]       = useState<Period>("Ce mois");
  const [kpis, setKpis]           = useState<any>(null);
  const [revenue, setRevenue]     = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = PERIOD_MAP[period];
    Promise.all([
      fetch(`/api/v1/dashboard/kpis?period=${p}`).then(r => r.json()),
      fetch(`/api/v1/dashboard/revenue?months=6`).then(r => r.json()).catch(() => []),
      fetch("/api/v1/reservations?limit=200").then(r => r.json()),
      fetch("/api/v1/properties").then(r => r.json()),
    ]).then(([k, rev, res, props]) => {
      setKpis(k);
      setRevenue(Array.isArray(rev) ? rev : []);
      setReservations(Array.isArray(res) ? res : []);
      setProperties(Array.isArray(props) ? props : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  const realRes = reservations.filter(r =>
    !["airbnb (not available)", "unavailable"].includes((r.guest_name || "").toLowerCase()) &&
    r.status !== "cancelled"
  );
  const blockedRes = reservations.filter(r =>
    (r.guest_name || "").toLowerCase().includes("not available")
  );

  const bySource: Record<string, number> = {};
  realRes.forEach(r => { bySource[r.source] = (bySource[r.source] || 0) + 1; });

  const maxRevenue = Math.max(...revenue.map(r => r.revenue || 0), 1);

  const SOURCE_COLORS: Record<string, string> = {
    airbnb:  ROSE,
    booking: "#3b82f6",
    direct:  "#1B7A4A",
    abritel: "#0891b2",
    manual:  "#7c3aed",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 13, color: INK_SOFT }}>Statistiques de votre portefeuille</p>
        </div>
        <div className="flex items-center gap-1" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 4 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: period === p ? INK : "transparent",
                color: period === p ? "#F4F2F0" : INK_SOFT,
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse" style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)" }} />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Taux d'occupation"  value={`${kpis?.occupancy_rate ?? 0}%`}    icon={Calendar} up={(kpis?.occupancy_rate ?? 0) > 50} />
            <KpiCard label="Revenus"            value={formatCurrency(kpis?.total_revenue ?? 0)} icon={Euro}     up={(kpis?.total_revenue ?? 0) > 0} sub="Prix iCal non disponibles" />
            <KpiCard label="Réservations"       value={kpis?.total_reservations ?? 0}       icon={BarChart2} />
            <KpiCard label="Biens actifs"       value={kpis?.active_properties ?? 0}        icon={Home} />
          </div>

          {/* Revenue chart + Reservations breakdown */}
          <div className="grid grid-cols-2 gap-6">

            {/* Revenue par mois */}
            <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontWeight: 700, color: INK, marginBottom: 20, fontSize: 15 }}>Revenus sur 6 mois</h2>
              {revenue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40" style={{ color: INK_SOFT }}>
                  <Euro size={28} style={{ color: "rgba(0,0,0,0.15)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>Aucun revenu enregistré</p>
                  <p style={{ fontSize: 10, color: "rgba(0,0,0,0.25)", marginTop: 4 }}>Les prix ne sont pas transmis via iCal Airbnb</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revenue.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ fontSize: 11, color: INK_SOFT, width: 52, flexShrink: 0, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.month}</span>
                      <div style={{ flex: 1, background: "rgba(26,14,18,0.06)", borderRadius: 99, height: 10 }}>
                        <div style={{
                          background: ROSE, height: 10, borderRadius: 99,
                          width: `${((r.revenue || 0) / maxRevenue) * 100}%`,
                          transition: "width 0.5s",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: INK, width: 72, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                        {(r.revenue || 0) > 0 ? formatCurrency(r.revenue) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Réservations par source */}
            <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontWeight: 700, color: INK, marginBottom: 20, fontSize: 15 }}>Réservations par source</h2>
              {Object.keys(bySource).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40" style={{ color: INK_SOFT }}>
                  <Calendar size={28} style={{ color: "rgba(0,0,0,0.15)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>Aucune réservation confirmée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(bySource).map(([source, count]) => (
                    <div key={source} className="flex items-center gap-3">
                      <div style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, background: SOURCE_COLORS[source] ?? INK_SOFT }} />
                      <span style={{ fontSize: 13, flex: 1, color: INK, fontWeight: 600, textTransform: "capitalize" }}>{source}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{count}</span>
                      <div style={{ width: 80, background: "rgba(26,14,18,0.06)", borderRadius: 99, height: 6 }}>
                        <div style={{
                          background: SOURCE_COLORS[source] ?? INK_SOFT,
                          height: 6, borderRadius: 99,
                          width: `${(count / Math.max(...Object.values(bySource))) * 100}%`,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Propriétés */}
          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 700, color: INK, marginBottom: 20, fontSize: 15 }}>Performance par bien</h2>
            {properties.length === 0 ? (
              <p style={{ fontSize: 13, color: INK_SOFT }}>Aucun bien configuré</p>
            ) : (
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                {properties.map(p => {
                  const propRes = realRes.filter(r => r.property_id === p.id);
                  const propBlocked = blockedRes.filter(r => r.property_id === p.id);
                  const totalNights = propRes.reduce((s: number, r: any) => s + (r.nights || 0), 0);
                  const occ = kpis?.active_properties > 0 ? kpis.occupancy_rate : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <div style={{
                        width: 40, height: 40, background: "rgba(224,32,96,0.08)", borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Home size={16} style={{ color: ROSE }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: INK, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: INK_SOFT }}>{p.city} · {p.bedrooms ?? "?"} ch. · {p.base_price_night ?? "?"}€/nuit</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{propRes.length} réservation{propRes.length > 1 ? "s" : ""}</div>
                        <div style={{ fontSize: 11, color: INK_SOFT }}>{totalNights} nuits · {propBlocked.length} périodes bloquées</div>
                      </div>
                      <div style={{ width: 80, textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: ROSE, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{occ}%</div>
                        <div style={{ fontSize: 10, color: INK_SOFT }}>occupation</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note iCal */}
          {(kpis?.total_revenue === 0 || kpis?.total_revenue == null) && (
            <div style={{
              background: "rgba(192,160,96,0.1)", border: "1px solid rgba(192,160,96,0.3)",
              borderRadius: 18, padding: 16, fontSize: 13, color: "#C0A060",
            }}>
              <strong>Revenus à 0€</strong> — Le format iCal Airbnb ne transmet pas les montants des réservations. Pour afficher vos vrais revenus, ajoutez les prix manuellement dans chaque réservation ou connectez un channel manager officiel (Guesty, Hostaway…).
            </div>
          )}
        </>
      )}
    </div>
  );
}

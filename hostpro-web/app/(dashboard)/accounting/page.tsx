"use client";
import { useEffect, useState } from "react";
import { Euro, TrendingUp, FileText, AlertCircle, RefreshCw, Plus, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const SOURCE_LABEL: Record<string, string> = {
  airbnb:  "Airbnb",
  booking: "Booking.com",
  abritel: "Abritel",
  direct:  "Direct",
  manual:  "Manuel",
};

function isBlocked(name: string | null) {
  const lower = (name || "").toLowerCase();
  return lower.includes("not available") || lower.includes("unavailable");
}

export default function AccountingPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [period, setPeriod]             = useState<"month" | "quarter" | "year">("month");

  const load = () => {
    setLoading(true);
    fetch("/api/v1/reservations?limit=200")
      .then(r => r.json())
      .then(data => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Filtrer par période
  const now = new Date();
  const periodStart = (() => {
    if (period === "month")   return new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === "quarter") return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return new Date(now.getFullYear(), 0, 1);
  })();

  const income = reservations.filter(r =>
    !isBlocked(r.guest_name) &&
    r.status !== "cancelled" &&
    new Date(r.check_in) >= periodStart
  );

  const totalRevenue = income.reduce((s, r) => s + (r.total_price ?? r.total_amount ?? 0), 0);
  const totalNights  = income.reduce((s, r) => s + (r.nights || 0), 0);
  const hasAmounts   = income.some(r => (r.total_price ?? r.total_amount ?? 0) > 0);

  const PERIOD_LABELS = { month: "Ce mois", quarter: "Trimestre", year: "Cette année" };

  const INK = "#1A0E12";
  const INK_SOFT = "#6B5A60";
  const ROSE = "#E02060";
  const PAPER = "#F4F2F0";

  const monoLabel: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em", textTransform: "uppercase" as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 13, color: INK_SOFT }}>Comptabilité basée sur vos réservations réelles</p>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(0,0,0,0.1)", color: INK_SOFT,
            padding: "8px 14px", borderRadius: 12, background: "white", cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>
            <RefreshCw size={13} /> Actualiser
          </button>
          <div className="flex items-center gap-1" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 4 }}>
            {(["month", "quarter", "year"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{
                  padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  background: period === p ? INK : "transparent",
                  color: period === p ? "#F4F2F0" : INK_SOFT,
                }}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert si pas de montants */}
      {!loading && !hasAmounts && income.length > 0 && (
        <div className="flex items-start gap-3" style={{
          background: "rgba(192,160,96,0.1)", border: "1px solid rgba(192,160,96,0.3)",
          borderRadius: 18, padding: "12px 16px", fontSize: 13, color: "#C0A060",
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Montants non disponibles</strong> — Le format iCal Airbnb ne transmet pas les prix.
            Cliquez sur une réservation pour ajouter le montant manuellement.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse" style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)" }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Euro, bg: "rgba(27,122,74,0.1)", color: "#1B7A4A", value: hasAmounts ? formatCurrency(totalRevenue) : "—", label: "Revenus bruts", sub: !hasAmounts ? "Prix à renseigner manuellement" : undefined },
            { icon: FileText, bg: "rgba(224,32,96,0.08)", color: ROSE, value: income.length, label: "Réservations" },
            { icon: Calendar, bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", value: totalNights, label: "Nuits louées" },
          ].map((k, i) => (
            <div key={i} style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 40, height: 40, background: k.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <k.icon size={17} style={{ color: k.color }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{k.value}</div>
              <div style={{ fontSize: 13, color: INK_SOFT }}>{k.label}</div>
              {k.sub && <div style={{ fontSize: 10, color: "rgba(0,0,0,0.25)", marginTop: 4 }}>{k.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Tableau des revenus */}
      <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontWeight: 700, color: INK, fontSize: 14 }}>Réservations — {PERIOD_LABELS[period]}</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse" style={{ background: PAPER, borderRadius: 10 }} />)}
          </div>
        ) : income.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: INK_SOFT }}>
            <FileText size={32} style={{ color: "rgba(0,0,0,0.15)", marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Aucune réservation sur cette période</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Synchronisez votre calendrier Airbnb pour voir vos revenus</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: PAPER, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Voyageur", "Bien", "Check-in", "Check-out", "Nuits", "Source", "Montant"].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={monoLabel}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {income.map(r => {
                const amount = r.total_price ?? r.total_amount ?? null;
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <td className="px-5 py-3.5">
                      <div style={{ fontWeight: 700, color: INK, fontSize: 13 }}>
                        {r.guest_name === "Reserved" ? "Voyageur Airbnb" : r.guest_name}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{r.reservation_code}</div>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: INK_SOFT, fontSize: 13 }}>{r.property_name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: INK_SOFT, fontSize: 13 }}>{formatDate(r.check_in)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: INK_SOFT, fontSize: 13 }}>{formatDate(r.check_out)}</td>
                    <td className="px-5 py-3.5" style={{ color: INK_SOFT, fontSize: 13 }}>{r.nights}n</td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 8px", borderRadius: 99, letterSpacing: "0.1em", background: "rgba(224,32,96,0.08)", color: "#C00040" }}>
                        {SOURCE_LABEL[r.source] ?? r.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontWeight: 700, fontSize: 13 }}>
                      {amount > 0
                        ? <span style={{ color: "#1B7A4A" }}>{formatCurrency(amount)}</span>
                        : <Link href={`/reservations/${r.id}`} style={{ fontSize: 11, color: ROSE, textDecoration: "underline", fontWeight: 600 }}>+ Ajouter</Link>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {hasAmounts && (
              <tfoot>
                <tr style={{ background: PAPER, borderTop: "2px solid rgba(0,0,0,0.08)" }}>
                  <td colSpan={6} className="px-5 py-3" style={{ fontSize: 13, fontWeight: 800, color: INK }}>TOTAL</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 800, color: "#1B7A4A" }}>{formatCurrency(totalRevenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}

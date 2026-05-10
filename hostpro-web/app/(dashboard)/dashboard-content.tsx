"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { formatCurrency, formatDateShort, statusColor, sourceLabel } from "@/lib/utils";
import { TrendingUp, Home, Calendar, AlertTriangle } from "lucide-react";

interface KPIs {
  occupancy_rate: number;
  total_revenue: number;
  adr: number;
  revpar: number;
  total_reservations: number;
  active_properties: number;
  period: string;
}

export function DashboardContent() {
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
          dashboardApi.kpis(period),
          dashboardApi.upcoming(14),
          dashboardApi.alerts(),
          dashboardApi.revenue(6),
        ]);
        setKpis(k.data);
        setUpcoming(u.data);
        setAlerts(a.data);
        setRevenue(r.data);
      } catch (e) { /* handle */ }
      setLoading(false);
    };
    load();
  }, [period]);

  const kpiCards = kpis ? [
    { label: "Taux d'occupation", value: `${kpis.occupancy_rate}%`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenus", value: formatCurrency(kpis.total_revenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "ADR", value: formatCurrency(kpis.adr), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "RevPAR", value: formatCurrency(kpis.revpar), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Réservations", value: kpis.total_reservations, icon: Calendar, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Biens actifs", value: kpis.active_properties, icon: Home, color: "text-slate-600", bg: "bg-slate-50" },
  ] : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-0.5">{kpis?.period || "Chargement..."}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
          {["month", "quarter", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p === "month" ? "Mois" : p === "quarter" ? "Trimestre" : "Année"}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              a.severity === "critical" ? "bg-red-50 border border-red-200 text-red-800" : "bg-amber-50 border border-amber-200 text-amber-800"
            }`}>
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span><strong>{a.property_name}</strong> — {a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {kpiCards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <c.icon size={20} className={c.color} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{c.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Revenus sur 6 mois</h2>
          {revenue.length > 0 ? (
            <div className="space-y-2">
              {revenue.map((r, i) => {
                const max = Math.max(...revenue.map((x) => x.revenue));
                const pct = max > 0 ? (r.revenue / max) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 flex-shrink-0">{r.month}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-900 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-20 text-right">{formatCurrency(r.revenue)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Aucune donnée</p>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Arrivées à venir (14j)</h2>
          {upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune arrivée prévue</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map((r) => (
                <div key={r.reservation_id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {r.guest_name || "Guest"} — {r.property_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)} · {r.nights} nuit{r.nights > 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex-shrink-0">
                    {sourceLabel(r.source)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

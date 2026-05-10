"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { formatCurrency, formatDateShort, sourceLabel } from "@/lib/utils";
import { TrendingUp, Home, Calendar, AlertTriangle, TrendingDown, ArrowUpRight } from "lucide-react";

interface KPIs {
  occupancy_rate: number;
  total_revenue: number;
  adr: number;
  revpar: number;
  total_reservations: number;
  active_properties: number;
  period: string;
}

const SOURCE_BADGE: Record<string, string> = {
  airbnb: "bg-[#FF5A5F]/10 text-[#FF5A5F]",
  booking: "bg-blue-100 text-blue-700",
  manual: "bg-[#FF5A5F]/10 text-[#FF5A5F]",
  direct: "bg-[#FF5A5F]/10 text-[#FF5A5F]",
  abritel: "bg-cyan-100 text-cyan-700",
};

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
      } catch (e) {
        // handle
      }
      setLoading(false);
    };
    load();
  }, [period]);

  const kpiCards = kpis
    ? [
        {
          label: "Taux d'occupation",
          value: `${kpis.occupancy_rate}%`,
          icon: Calendar,
          trend: "+3.2%",
          up: true,
        },
        {
          label: "Revenus du mois",
          value: formatCurrency(kpis.total_revenue),
          icon: TrendingUp,
          trend: "+12.5%",
          up: true,
        },
        {
          label: "Prix moyen / nuit",
          value: formatCurrency(kpis.adr),
          icon: TrendingUp,
          trend: "+5.8%",
          up: true,
        },
        {
          label: "RevPAR",
          value: formatCurrency(kpis.revpar),
          icon: TrendingUp,
          trend: "-1.2%",
          up: false,
        },
        {
          label: "Réservations",
          value: kpis.total_reservations,
          icon: Calendar,
          trend: "+8",
          up: true,
        },
        {
          label: "Biens actifs",
          value: kpis.active_properties,
          icon: Home,
          trend: "0",
          up: true,
        },
      ]
    : [];

  const PERIOD_LABELS: Record<string, string> = {
    month: "Ce mois",
    quarter: "Trimestre",
    year: "Cette année",
  };

  return (
    <div>
      {/* Period selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#717171]">{kpis?.period || "Chargement des données..."}</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#DDDDDD] rounded-xl p-1">
          {(["month", "quarter", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-[#222222] text-white"
                  : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${
                a.severity === "critical"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>
                <strong>{a.property_name}</strong> — {a.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-6 h-28 animate-pulse bg-[#F7F7F7]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {kpiCards.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
                  <c.icon size={22} className="text-[#FF5A5F]" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    c.up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {c.up ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
                  {c.trend}
                </div>
              </div>
              <div className="text-3xl font-bold text-[#222222] mb-1">{c.value}</div>
              <div className="text-sm text-[#717171]">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#222222]">Revenus sur 6 mois</h2>
            <span className="text-xs text-[#717171]">En euros</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-5 bg-[#F7F7F7] rounded-full animate-pulse" />
              ))}
            </div>
          ) : revenue.length > 0 ? (
            <div className="space-y-3">
              {revenue.map((r, i) => {
                const max = Math.max(...revenue.map((x) => x.revenue));
                const pct = max > 0 ? (r.revenue / max) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-[#717171] w-14 flex-shrink-0 font-medium">{r.month}</span>
                    <div className="flex-1 bg-[#F7F7F7] rounded-full h-2.5">
                      <div
                        className="bg-[#FF5A5F] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#222222] w-20 text-right">
                      {formatCurrency(r.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-[#717171] text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Upcoming arrivals */}
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#222222]">Arrivées à venir</h2>
            <span className="text-xs text-[#717171] bg-[#F7F7F7] px-2.5 py-1 rounded-full">14 jours</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-[#F7F7F7] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-[#717171]">
              <Calendar size={32} className="mb-2 text-[#DDDDDD]" />
              <p className="text-sm">Aucune arrivée prévue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map((r) => (
                <div
                  key={r.reservation_id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F7F7] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF5A5F] text-xs font-bold">
                      {(r.guest_name || "G")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#222222] truncate">
                      {r.guest_name || "Voyageur"} — {r.property_name}
                    </div>
                    <div className="text-xs text-[#717171]">
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)} · {r.nights} nuit
                      {r.nights > 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      SOURCE_BADGE[r.source] || "bg-[#F7F7F7] text-[#717171]"
                    }`}
                  >
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

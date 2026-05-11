"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/lib/api";
import { formatCurrency, formatDateShort, sourceLabel } from "@/lib/utils";
import { TrendingUp, Home, Calendar, AlertTriangle, TrendingDown, ArrowUpRight, Plus, Sparkles, Zap, BarChart2, ChevronRight, CheckCircle } from "lucide-react";
import { withMock, MOCK_DASHBOARD_KPIS, MOCK_REVENUE, MOCK_UPCOMING, MOCK_ALERTS } from "@/lib/mock";

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

const ONBOARDING_STEPS = [
  { id: "property", label: "Ajouter une propriété", desc: "Créez votre premier bien locatif", href: "/properties", icon: Home },
  { id: "platform", label: "Connecter une plateforme", desc: "Synchronisez Airbnb, Booking.com…", href: "/settings", icon: Calendar },
  { id: "pricing", label: "Activer la tarification IA", desc: "Optimisez vos prix automatiquement", href: "/pricing", icon: Sparkles },
  { id: "automation", label: "Configurer l'automatisation", desc: "Check-in, ménage, messages auto", href: "/automation", icon: Zap },
];

function EmptyDashboard() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-[#FF5A5F]/10 border-2 border-[#FF5A5F]/20 rounded-3xl flex items-center justify-center mb-6">
        <Sparkles size={36} className="text-[#FF5A5F]" />
      </div>
      <h2 className="text-2xl font-black text-[#222222] mb-2">Bienvenue sur HOSTPRO !</h2>
      <p className="text-[#717171] mb-10 max-w-md">
        Votre tableau de bord est vide pour l'instant. Commencez par ajouter votre première propriété pour débloquer toutes les fonctionnalités.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-8">
        {ONBOARDING_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => router.push(s.href)}
            className="flex items-start gap-4 bg-white border border-[#DDDDDD] rounded-2xl p-5 hover:shadow-sm hover:border-[#FF5A5F]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-[#FF5A5F]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-[#BBBBBB]">0{i + 1}</span>
              </div>
              <div className="font-semibold text-sm text-[#222222] group-hover:text-[#FF5A5F] transition-colors">{s.label}</div>
              <div className="text-xs text-[#717171] mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight size={16} className="text-[#DDDDDD] group-hover:text-[#FF5A5F] flex-shrink-0 mt-0.5 transition-colors" />
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/properties")}
        className="inline-flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#FF5A5F]/20"
      >
        <Plus size={18} /> Ajouter ma première propriété
      </button>

      <p className="text-xs text-[#717171] mt-5">
        Ou{" "}
        <button onClick={() => router.push("/assistant")} className="text-[#FF5A5F] font-semibold hover:underline">
          demandez à l'assistant IA
        </button>{" "}
        comment démarrer.
      </p>
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
      const [k, u, a, r] = await Promise.all([
        withMock(() => dashboardApi.kpis(period), MOCK_DASHBOARD_KPIS),
        withMock(() => dashboardApi.upcoming(14), MOCK_UPCOMING),
        withMock(() => dashboardApi.alerts(),     MOCK_ALERTS),
        withMock(() => dashboardApi.revenue(6),   MOCK_REVENUE),
      ]);
      setKpis(k as KPIs);
      setUpcoming(u as any[]);
      setAlerts(a as any[]);
      setRevenue(r as any[]);
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

  // Show onboarding empty state if no properties
  if (!loading && kpis && kpis.active_properties === 0) {
    return <EmptyDashboard />;
  }

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

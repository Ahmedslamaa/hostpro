"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/lib/api";
import { formatCurrency, formatDateShort, sourceLabel, cn } from "@/lib/utils";
import { TrendingUp, Home, Calendar, AlertTriangle, TrendingDown, ArrowUpRight, Plus, Sparkles, Zap, BarChart2, ChevronRight, CheckCircle } from "lucide-react";
import { colors } from "@/lib/design-system";

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
  airbnb: "bg-primary-50 text-primary-600",
  booking: "bg-blue-50 text-blue-700",
  manual: "bg-primary-50 text-primary-600",
  direct: "bg-primary-50 text-primary-600",
  abritel: "bg-cyan-50 text-cyan-700",
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
      <h2 className="text-3xl font-bold text-neutral-900 mb-3">Bienvenue sur HOST PRO</h2>
      <p className="text-neutral-600 mb-10 max-w-md text-base">
        Votre tableau de bord est vide pour l'instant. Commencez par ajouter votre première propriété pour débloquer toutes les fonctionnalités.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-8">
        {ONBOARDING_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => router.push(s.href)}
            className="flex items-start gap-4 bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md hover:border-primary-100 transition-all duration-200 text-left group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-primary-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-neutral-400">0{i + 1}</span>
              </div>
              <div className="font-semibold text-sm text-neutral-900 group-hover:text-primary-600 transition-colors duration-200">{s.label}</div>
              <div className="text-xs text-neutral-600 mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary-500 flex-shrink-0 mt-0.5 transition-colors duration-200" />
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/properties")}
        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Plus size={18} /> Ajouter ma première propriété
      </button>

      <p className="text-xs text-neutral-600 mt-5">
        Ou{" "}
        <button onClick={() => router.push("/assistant")} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
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
        setKpis(null);
        setUpcoming([]);
        setAlerts([]);
        setRevenue([]);
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
          value: formatCurrency((kpis as any).total_revenue ?? (kpis as any).revenue ?? 0),
          icon: TrendingUp,
          trend: "+12.5%",
          up: true,
        },
        {
          label: "Prix moyen / nuit",
          value: formatCurrency((kpis as any).adr ?? (kpis as any).avg_price_per_night ?? 0),
          icon: TrendingUp,
          trend: "+5.8%",
          up: true,
        },
        {
          label: "RevPAR",
          value: formatCurrency((kpis as any).revpar ?? (kpis as any).rev_par ?? 0),
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-neutral-600">{kpis?.period || "Chargement des données..."}</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
          {(["month", "quarter", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm border transition-colors duration-200 ${
                a.severity === "critical"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 h-28 animate-pulse bg-neutral-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {kpiCards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <c.icon size={22} className="text-primary-500" />
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
              <div className="text-3xl font-bold text-neutral-900 mb-1">{c.value}</div>
              <div className="text-sm text-neutral-600">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-neutral-900 text-base">Revenus sur 6 mois</h2>
            <span className="text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-lg">En euros</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-5 bg-neutral-100 rounded-full animate-pulse" />
              ))}
            </div>
          ) : revenue.length > 0 ? (
            <div className="space-y-3">
              {revenue.map((r, i) => {
                const max = Math.max(...revenue.map((x) => x.revenue));
                const pct = max > 0 ? (r.revenue / max) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-600 w-14 flex-shrink-0 font-medium">{r.month}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-2.5">
                      <div
                        className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 w-20 text-right">
                      {formatCurrency(r.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-neutral-500 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Upcoming arrivals */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-neutral-900 text-base">Arrivées à venir</h2>
            <span className="text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-lg">14 jours</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
              <Calendar size={32} className="mb-2 text-neutral-300" />
              <p className="text-sm">Aucune arrivée prévue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map((r) => (
                <div
                  key={r.reservation_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-xs font-bold">
                      {(r.guest_name || "G")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-900 truncate">
                      {r.guest_name || "Voyageur"} — {r.property_name}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {formatDateShort(r.check_in)}  {formatDateShort(r.check_out)} · {r.nights} nuit
                      {r.nights > 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      SOURCE_BADGE[r.source] || "bg-neutral-100 text-neutral-600"
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

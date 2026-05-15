"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Home, Calendar, Euro, Moon, BarChart2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PERIODS = ["Ce mois", "3 mois", "Cette année"] as const;
type Period = typeof PERIODS[number];

const PERIOD_MAP: Record<Period, string> = {
  "Ce mois": "month",
  "3 mois":  "quarter",
  "Cette année": "year",
};

function KpiCard({ label, value, sub, icon: Icon, up }: { label: string; value: string | number; sub?: string; icon: any; up?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDDDDD] p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
          <Icon size={18} className="text-[#FF5A5F]" />
        </div>
        {up !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-[#222222] mb-0.5">{value}</div>
      <div className="text-sm text-[#717171]">{label}</div>
      {sub && <div className="text-xs text-[#BBBBBB] mt-1">{sub}</div>}
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

  // Calculs depuis les vraies données
  const realRes = reservations.filter(r =>
    !["airbnb (not available)", "unavailable"].includes((r.guest_name || "").toLowerCase()) &&
    r.status !== "cancelled"
  );
  const blockedRes = reservations.filter(r =>
    (r.guest_name || "").toLowerCase().includes("not available")
  );

  // Source breakdown
  const bySource: Record<string, number> = {};
  realRes.forEach(r => { bySource[r.source] = (bySource[r.source] || 0) + 1; });

  const maxRevenue = Math.max(...revenue.map(r => r.revenue || 0), 1);

  const SOURCE_COLORS: Record<string, string> = {
    airbnb:  "bg-[#FF5A5F]",
    booking: "bg-blue-500",
    direct:  "bg-green-500",
    abritel: "bg-cyan-500",
    manual:  "bg-purple-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#717171]">Statistiques de votre portefeuille</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#DDDDDD] rounded-xl p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p ? "bg-[#222222] text-white" : "text-[#717171] hover:text-[#222222]"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#DDDDDD] animate-pulse" />
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
            <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
              <h2 className="font-semibold text-[#222222] mb-5">Revenus sur 6 mois</h2>
              {revenue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#717171]">
                  <Euro size={28} className="text-[#DDDDDD] mb-2" />
                  <p className="text-sm">Aucun revenu enregistré</p>
                  <p className="text-xs text-[#BBBBBB] mt-1">Les prix ne sont pas transmis via iCal Airbnb</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revenue.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-[#717171] w-14 flex-shrink-0 font-medium">{r.month}</span>
                      <div className="flex-1 bg-[#F7F7F7] rounded-full h-2.5">
                        <div className="bg-[#FF5A5F] h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${((r.revenue || 0) / maxRevenue) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[#222222] w-20 text-right">
                        {(r.revenue || 0) > 0 ? formatCurrency(r.revenue) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Réservations par source */}
            <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
              <h2 className="font-semibold text-[#222222] mb-5">Réservations par source</h2>
              {Object.keys(bySource).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#717171]">
                  <Calendar size={28} className="text-[#DDDDDD] mb-2" />
                  <p className="text-sm">Aucune réservation confirmée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(bySource).map(([source, count]) => (
                    <div key={source} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SOURCE_COLORS[source] ?? "bg-[#717171]"}`} />
                      <span className="text-sm capitalize flex-1 text-[#222222] font-medium">{source}</span>
                      <span className="text-sm font-black text-[#222222]">{count}</span>
                      <div className="w-24 bg-[#F7F7F7] rounded-full h-2">
                        <div className={`${SOURCE_COLORS[source] ?? "bg-[#717171]"} h-2 rounded-full`}
                          style={{ width: `${(count / Math.max(...Object.values(bySource))) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Propriétés */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="font-semibold text-[#222222] mb-5">Performance par bien</h2>
            {properties.length === 0 ? (
              <p className="text-sm text-[#717171]">Aucun bien configuré</p>
            ) : (
              <div className="divide-y divide-[#F7F7F7]">
                {properties.map(p => {
                  const propRes = realRes.filter(r => r.property_id === p.id);
                  const propBlocked = blockedRes.filter(r => r.property_id === p.id);
                  const totalNights = propRes.reduce((s: number, r: any) => s + (r.nights || 0), 0);
                  const occ = kpis?.active_properties > 0 ? kpis.occupancy_rate : 0;
                  return (
                    <div key={p.id} className="py-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Home size={16} className="text-[#FF5A5F]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#222222] text-sm">{p.name}</div>
                        <div className="text-xs text-[#717171]">{p.city} · {p.bedrooms ?? "?"} ch. · {p.base_price_night ?? "?"}€/nuit</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#222222]">{propRes.length} réservation{propRes.length > 1 ? "s" : ""}</div>
                        <div className="text-xs text-[#717171]">{totalNights} nuits · {propBlocked.length} périodes bloquées</div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-lg font-black text-[#FF5A5F]">{occ}%</div>
                        <div className="text-xs text-[#717171]">occupation</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note iCal */}
          {(kpis?.total_revenue === 0 || kpis?.total_revenue == null) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              <strong>Revenus à 0€</strong> — Le format iCal Airbnb ne transmet pas les montants des réservations. Pour afficher vos vrais revenus, ajoutez les prix manuellement dans chaque réservation ou connectez un channel manager officiel (Guesty, Hostaway…).
            </div>
          )}
        </>
      )}
    </div>
  );
}

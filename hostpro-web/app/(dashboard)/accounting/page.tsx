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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">Comptabilité basée sur vos réservations réelles</p>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 border border-neutral-200 text-neutral-500 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors">
            <RefreshCw size={14} /> Actualiser
          </button>
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1">
            {(["month", "quarter", "year"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert si pas de montants */}
      {!loading && !hasAmounts && income.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Montants non disponibles</strong> — Le format iCal Airbnb ne transmet pas les prix.
            Cliquez sur une réservation pour ajouter le montant manuellement.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Euro size={18} className="text-green-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">{hasAmounts ? formatCurrency(totalRevenue) : "—"}</div>
            <div className="text-sm text-neutral-500">Revenus bruts</div>
            {!hasAmounts && <div className="text-xs text-neutral-300 mt-1">Prix à renseigner manuellement</div>}
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mb-3">
              <FileText size={18} className="text-primary-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">{income.length}</div>
            <div className="text-sm text-neutral-500">Réservations</div>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">{totalNights}</div>
            <div className="text-sm text-neutral-500">Nuits louées</div>
          </div>
        </div>
      )}

      {/* Tableau des revenus */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">Réservations — {PERIOD_LABELS[period]}</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl animate-pulse" />)}
          </div>
        ) : income.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <FileText size={32} className="text-[#DDDDDD] mb-3" />
            <p className="font-medium">Aucune réservation sur cette période</p>
            <p className="text-sm mt-1">Synchronisez votre calendrier Airbnb pour voir vos revenus</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200">
                {["Voyageur", "Bien", "Check-in", "Check-out", "Nuits", "Source", "Montant"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {income.map(r => {
                const amount = r.total_price ?? r.total_amount ?? null;
                return (
                  <tr key={r.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-neutral-900">
                        {r.guest_name === "Reserved" ? "Voyageur Airbnb" : r.guest_name}
                      </div>
                      <div className="text-xs text-neutral-300">{r.reservation_code}</div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">{r.property_name}</td>
                    <td className="px-5 py-3.5 text-neutral-500 whitespace-nowrap">{formatDate(r.check_in)}</td>
                    <td className="px-5 py-3.5 text-neutral-500 whitespace-nowrap">{formatDate(r.check_out)}</td>
                    <td className="px-5 py-3.5 text-neutral-500">{r.nights}n</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-primary-500/10 text-primary-600">
                        {SOURCE_LABEL[r.source] ?? r.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {amount > 0
                        ? <span className="text-green-600">{formatCurrency(amount)}</span>
                        : <Link href={`/reservations/${r.id}`} className="text-xs text-primary-600 hover:underline font-medium">+ Ajouter</Link>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {hasAmounts && (
              <tfoot>
                <tr className="bg-neutral-100 border-t-2 border-neutral-200">
                  <td colSpan={6} className="px-5 py-3 text-sm font-bold text-neutral-900">TOTAL</td>
                  <td className="px-5 py-3 text-sm font-black text-green-700">{formatCurrency(totalRevenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}

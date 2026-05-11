"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { reservationsApi } from "@/lib/api";
import { withMock, MOCK_RESERVATIONS } from "@/lib/mock";
import { formatDate, formatCurrency, sourceLabel } from "@/lib/utils";
import { Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700" },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  completed: { label: "Terminée", className: "bg-[#F7F7F7] text-[#717171]" },
  no_show: { label: "No-show", className: "bg-[#F7F7F7] text-[#717171]" },
};

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  airbnb: { label: "Airbnb", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  booking: { label: "Booking", className: "bg-blue-100 text-blue-700" },
  manual: { label: "Direct", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  direct: { label: "Direct", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  abritel: { label: "Abritel", className: "bg-cyan-100 text-cyan-700" },
};

const STATUS_TABS = [
  { value: "", label: "Toutes" },
  { value: "confirmed", label: "En cours" },
  { value: "pending", label: "À venir" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    withMock(() => reservationsApi.list(), MOCK_RESERVATIONS).then((data) => {
      setReservations(Array.isArray(data) ? data : MOCK_RESERVATIONS);
      setLoading(false);
    });
  }, []);

  const filtered = reservations.filter((r) => {
    const name = (r.guest_name || r.guest?.full_name || "").toLowerCase();
    const prop = (r.property_name || "").toLowerCase();
    const q = search.toLowerCase();
    return (!q || name.includes(q) || prop.includes(q)) && (!statusFilter || r.status === statusFilter);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#717171]">
          {reservations.length} réservation{reservations.length !== 1 ? "s" : ""} au total
        </p>
        <Link
          href="/reservations/new"
          className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} />
          Nouvelle réservation
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white border border-[#DDDDDD] rounded-xl p-1 w-fit">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === value
                ? "bg-[#222222] text-white"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
          <input
            className="border border-[#DDDDDD] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
            placeholder="Rechercher un voyageur ou un bien..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#F7F7F7] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F7F7] border-b border-[#DDDDDD]">
                {["Voyageur", "Propriété", "Dates", "Durée", "Montant", "Source", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#717171]">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const statusCfg = STATUS_CONFIG[r.status] || { label: r.status, className: "bg-[#F7F7F7] text-[#717171]" };
                  const sourceCfg = SOURCE_CONFIG[r.source] || { label: sourceLabel(r.source), className: "bg-[#F7F7F7] text-[#717171]" };
                  return (
                    <tr key={r.id} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[#FF5A5F] text-xs font-bold">
                              {(r.guest_name || r.guest?.full_name || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#222222]">{r.guest_name || r.guest?.full_name || "—"}</div>
                            <div className="text-xs text-[#717171]">{r.reservation_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#717171]">{r.property_name || "—"}</td>
                      <td className="px-5 py-4 text-[#717171]">
                        {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      </td>
                      <td className="px-5 py-4 text-[#717171]">
                        {r.nights} nuit{r.nights > 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#222222]">
                        {r.total_price ? formatCurrency(r.total_price) : r.net_revenue ? formatCurrency(r.net_revenue) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sourceCfg.className}`}>
                          {sourceCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/reservations/${r.id}`}
                          className="inline-flex items-center gap-1 text-[#717171] hover:text-[#222222] transition-colors text-xs font-medium"
                        >
                          <Eye size={14} /> Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#DDDDDD]">
              <span className="text-sm text-[#717171]">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? "bg-[#222222] text-white"
                        : "border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

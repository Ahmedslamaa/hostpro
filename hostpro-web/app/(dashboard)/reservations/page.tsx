"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency, sourceLabel } from "@/lib/utils";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed:  { label: "Confirmée",  className: "bg-green-100 text-green-700" },
  pending:    { label: "En attente", className: "bg-amber-100 text-amber-700" },
  cancelled:  { label: "Annulée",    className: "bg-red-100 text-red-700" },
  completed:  { label: "Terminée",   className: "bg-[#F7F7F7] text-[#717171]" },
  no_show:    { label: "No-show",    className: "bg-[#F7F7F7] text-[#717171]" },
};

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  airbnb:  { label: "Airbnb",   className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  booking: { label: "Booking",  className: "bg-blue-100 text-blue-700" },
  manual:  { label: "Direct",   className: "bg-green-100 text-green-700" },
  direct:  { label: "Direct",   className: "bg-green-100 text-green-700" },
  abritel: { label: "Abritel",  className: "bg-cyan-100 text-cyan-700" },
};

const STATUS_TABS = [
  { value: "",          label: "Toutes" },
  { value: "confirmed", label: "Confirmées" },
  { value: "pending",   label: "En attente" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

/** "Airbnb (Not available)" = période bloquée, pas une vraie réservation invité */
function normalizeGuestName(name: string | null): { display: string; isBlocked: boolean } {
  if (!name) return { display: "—", isBlocked: false };
  const lower = name.toLowerCase();
  if (lower.includes("not available") || lower.includes("unavailable")) {
    return { display: "Période bloquée", isBlocked: true };
  }
  if (lower === "reserved") {
    return { display: "Voyageur (Airbnb)", isBlocked: false };
  }
  return { display: name, isBlocked: false };
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [syncing, setSyncing]     = useState(false);
  const PER_PAGE = 10;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/reservations?limit=200");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : (data.data ?? []));
    } catch (e: any) {
      setError("Impossible de charger les réservations. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSyncIcal = async () => {
    setSyncing(true);
    try {
      const feedsRes = await fetch("/api/v1/ical/feeds");
      const feeds = await feedsRes.json();
      await Promise.all(
        feeds.map((f: any) =>
          fetch(`/api/v1/ical/feeds/${f.id}/sync`, { method: "POST" })
        )
      );
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const filtered = reservations.filter((r) => {
    const name = (r.guest_name || "").toLowerCase();
    const prop = (r.property_name || "").toLowerCase();
    const q    = search.toLowerCase();
    return (
      (!q || name.includes(q) || prop.includes(q)) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // counts for tabs
  const counts: Record<string, number> = { "": reservations.length };
  STATUS_TABS.slice(1).forEach(t => {
    counts[t.value] = reservations.filter(r => r.status === t.value).length;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#717171]">
          {loading ? "Chargement…" : `${reservations.length} réservation${reservations.length !== 1 ? "s" : ""} au total`}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncIcal}
            disabled={syncing}
            className="flex items-center gap-2 border border-[#DDDDDD] text-[#717171] hover:text-[#222222] hover:border-[#222222] font-medium px-4 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Synchronisation…" : "Sync Airbnb"}
          </button>
          <Link
            href="/reservations/new"
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
          >
            <Plus size={16} />
            Nouvelle réservation
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
          <button onClick={load} className="ml-auto text-red-600 underline text-xs">Réessayer</button>
        </div>
      )}

      {/* iCal info banner — montants non dispos via iCal */}
      {!loading && reservations.length > 0 && reservations.some(r => r.total_price === null) && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 mb-5 text-xs">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Montants non disponibles</strong> — Le format iCal Airbnb ne transmet pas les prix.
            Ajoutez-les manuellement en cliquant sur une réservation, ou synchronisez depuis un channel manager officiel.
          </span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white border border-[#DDDDDD] rounded-xl p-1 w-fit">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === value ? "bg-[#222222] text-white" : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            {label}
            {counts[value] > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                statusFilter === value ? "bg-white/20 text-white" : "bg-[#F7F7F7] text-[#717171]"
              }`}>
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
        <input
          className="border border-[#DDDDDD] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full transition-all"
          placeholder="Rechercher un voyageur ou un bien…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
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
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#717171]">
                    {search || statusFilter ? "Aucune réservation correspondante" : "Aucune réservation pour l'instant"}
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const { display: guestDisplay, isBlocked } = normalizeGuestName(r.guest_name);
                  const statusCfg = STATUS_CONFIG[r.status] ?? { label: r.status, className: "bg-[#F7F7F7] text-[#717171]" };
                  const sourceCfg = SOURCE_CONFIG[r.source] ?? { label: sourceLabel(r.source), className: "bg-[#F7F7F7] text-[#717171]" };
                  const amount = r.total_price ?? r.total_amount ?? r.net_revenue;

                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors ${isBlocked ? "opacity-60" : ""}`}
                    >
                      {/* Voyageur */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBlocked ? "bg-[#F7F7F7]" : "bg-[#FF5A5F]/10"}`}>
                            <span className={`text-xs font-bold ${isBlocked ? "text-[#BBBBBB]" : "text-[#FF5A5F]"}`}>
                              {isBlocked ? "🔒" : guestDisplay[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <div className={`font-semibold ${isBlocked ? "text-[#717171] italic" : "text-[#222222]"}`}>
                              {guestDisplay}
                            </div>
                            <div className="text-xs text-[#BBBBBB]">{r.reservation_code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Propriété */}
                      <td className="px-5 py-4 text-[#717171]">{r.property_name || "—"}</td>

                      {/* Dates */}
                      <td className="px-5 py-4 text-[#717171] whitespace-nowrap">
                        {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      </td>

                      {/* Durée */}
                      <td className="px-5 py-4 text-[#717171] whitespace-nowrap">
                        {r.nights} nuit{r.nights > 1 ? "s" : ""}
                      </td>

                      {/* Montant */}
                      <td className="px-5 py-4 font-semibold text-[#222222]">
                        {amount ? formatCurrency(amount) : <span className="text-[#BBBBBB] font-normal text-xs">Non renseigné</span>}
                      </td>

                      {/* Source */}
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sourceCfg.className}`}>
                          {sourceCfg.label}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusCfg.className}`}>
                          {isBlocked ? "Bloquée" : statusCfg.label}
                        </span>
                      </td>

                      {/* Action */}
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
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-40 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      page === p ? "bg-[#222222] text-white" : "border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7]"
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-40 transition-all">
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

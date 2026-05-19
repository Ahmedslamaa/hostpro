"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency, sourceLabel } from "@/lib/utils";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

const STATUS_CONFIG: Record<string, { label: string; style: React.CSSProperties }> = {
  confirmed: { label: "Confirmée",  style: { background: "rgba(27,122,74,0.1)",    color: "#1B7A4A" } },
  pending:   { label: "En attente", style: { background: "rgba(192,160,96,0.15)",   color: "#C0A060" } },
  cancelled: { label: "Annulée",    style: { background: "rgba(192,0,64,0.1)",      color: "#C00040" } },
  completed: { label: "Terminée",   style: { background: "rgba(26,14,18,0.06)",     color: INK_SOFT  } },
  no_show:   { label: "No-show",    style: { background: "rgba(26,14,18,0.06)",     color: INK_SOFT  } },
};

const SOURCE_CONFIG: Record<string, { label: string; style: React.CSSProperties }> = {
  airbnb:  { label: "Airbnb",   style: { background: "rgba(224,32,96,0.08)",  color: "#C00040" } },
  booking: { label: "Booking",  style: { background: "rgba(59,130,246,0.1)",  color: "#1d4ed8" } },
  manual:  { label: "Direct",   style: { background: "rgba(27,122,74,0.1)",   color: "#1B7A4A" } },
  direct:  { label: "Direct",   style: { background: "rgba(27,122,74,0.1)",   color: "#1B7A4A" } },
  abritel: { label: "Abritel",  style: { background: "rgba(6,182,212,0.1)",   color: "#0891b2" } },
};

const STATUS_TABS = [
  { value: "",          label: "Toutes" },
  { value: "confirmed", label: "Confirmées" },
  { value: "pending",   label: "En attente" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

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

  const counts: Record<string, number> = { "": reservations.length };
  STATUS_TABS.slice(1).forEach(t => {
    counts[t.value] = reservations.filter(r => r.status === t.value).length;
  });

  const monoLabel: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em", textTransform: "uppercase" as const,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p style={{ fontSize: 13, color: INK_SOFT }}>
          {loading ? "Chargement…" : `${reservations.length} réservation${reservations.length !== 1 ? "s" : ""} au total`}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncIcal}
            disabled={syncing}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(0,0,0,0.1)", color: INK_SOFT, fontWeight: 600,
              padding: "10px 16px", borderRadius: 12, background: "white", cursor: "pointer", fontSize: 13,
            }}
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Synchronisation…" : "Sync Airbnb"}
          </button>
          <Link
            href="/reservations/new"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: INK, color: "#F4F2F0",
              borderRadius: 12, padding: "10px 18px",
              fontWeight: 700, fontSize: 13, textDecoration: "none",
            }}
          >
            <Plus size={15} />
            Nouvelle réservation
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "rgba(192,0,64,0.06)", border: "1px solid rgba(192,0,64,0.2)",
          color: "#C00040", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13,
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {error}
          <button onClick={load} style={{ marginLeft: "auto", color: "#C00040", textDecoration: "underline", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}>Réessayer</button>
        </div>
      )}

      {/* iCal info banner */}
      {!loading && reservations.length > 0 && reservations.some(r => r.total_price === null) && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
          color: "#1d4ed8", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 11,
        }}>
          <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Montants non disponibles</strong> — Le format iCal Airbnb ne transmet pas les prix.
            Ajoutez-les manuellement en cliquant sur une réservation, ou synchronisez depuis un channel manager officiel.
          </span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 w-fit" style={{
        background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 4,
      }}>
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: statusFilter === value ? INK : "transparent",
              color: statusFilter === value ? "#F4F2F0" : INK_SOFT,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {label}
            {counts[value] > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 99,
                background: statusFilter === value ? "rgba(255,255,255,0.2)" : "rgba(26,14,18,0.06)",
                color: statusFilter === value ? "white" : INK_SOFT,
              }}>
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: INK_SOFT }} />
        <input
          style={{
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, paddingLeft: 40, paddingRight: 14,
            paddingTop: 10, paddingBottom: 10, fontSize: 13, color: INK,
            background: "white", outline: "none", width: "100%",
          }}
          placeholder="Rechercher un voyageur ou un bien…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse" style={{ background: PAPER, borderRadius: 10 }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: PAPER, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Voyageur", "Propriété", "Dates", "Durée", "Montant", "Source", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5" style={monoLabel}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16" style={{ color: INK_SOFT }}>
                    {search || statusFilter ? "Aucune réservation correspondante" : "Aucune réservation pour l'instant"}
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const { display: guestDisplay, isBlocked } = normalizeGuestName(r.guest_name);
                  const statusCfg = STATUS_CONFIG[r.status] ?? { label: r.status, style: { background: "rgba(26,14,18,0.06)", color: INK_SOFT } };
                  const sourceCfg = SOURCE_CONFIG[r.source] ?? { label: sourceLabel(r.source), style: { background: "rgba(26,14,18,0.06)", color: INK_SOFT } };
                  const amount = r.total_price ?? r.total_amount ?? r.net_revenue;

                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", opacity: isBlocked ? 0.6 : 1 }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: isBlocked ? "rgba(26,14,18,0.06)" : "rgba(224,32,96,0.08)",
                          }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800,
                              color: isBlocked ? INK_SOFT : "#C00040",
                            }}>
                              {isBlocked ? "🔒" : guestDisplay[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <div style={{
                              fontWeight: 600, color: isBlocked ? INK_SOFT : INK,
                              fontStyle: isBlocked ? "italic" : "normal", fontSize: 13,
                            }}>
                              {guestDisplay}
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{r.reservation_code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4" style={{ color: INK_SOFT, fontSize: 13 }}>{r.property_name || "—"}</td>

                      <td className="px-5 py-4 whitespace-nowrap" style={{ color: INK_SOFT, fontSize: 13 }}>
                        {formatDate(r.check_in)}  {formatDate(r.check_out)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap" style={{ color: INK_SOFT, fontSize: 13 }}>
                        {r.nights} nuit{r.nights > 1 ? "s" : ""}
                      </td>

                      <td className="px-5 py-4" style={{ fontWeight: 700, color: INK, fontSize: 13 }}>
                        {amount ? formatCurrency(amount) : <span style={{ color: "rgba(0,0,0,0.2)", fontWeight: 400, fontSize: 11 }}>Non renseigné</span>}
                      </td>

                      <td className="px-5 py-4">
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                          padding: "4px 8px", borderRadius: 99,
                          ...sourceCfg.style,
                        }}>
                          {sourceCfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                          padding: "4px 8px", borderRadius: 99,
                          ...statusCfg.style,
                        }}>
                          {isBlocked ? "Bloquée" : statusCfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/reservations/${r.id}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, color: INK_SOFT, fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                        >
                          <Eye size={13} /> Voir
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
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 13, color: INK_SOFT }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", color: INK_SOFT,
                    background: "white", cursor: "pointer", opacity: page === 1 ? 0.4 : 1,
                  }}>
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: page === p ? INK : "white",
                      color: page === p ? "#F4F2F0" : INK_SOFT,
                      border: page === p ? "none" : "1px solid rgba(0,0,0,0.1)",
                    }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", color: INK_SOFT,
                    background: "white", cursor: "pointer", opacity: page === totalPages ? 0.4 : 1,
                  }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

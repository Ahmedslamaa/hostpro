"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Home, MapPin, Users, BedDouble, TrendingUp, Moon, Eye, Pencil, Star } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const GOLD_DEEP = "#C0A060";
const PAPER = "#F4F2F0";

const STATUS_CONFIG: Record<string, { label: string; style: React.CSSProperties }> = {
  active:      { label: "Actif",       style: { background: "rgba(27,122,74,0.1)", color: "#1B7A4A" } },
  inactive:    { label: "Inactif",     style: { background: "rgba(26,14,18,0.06)", color: INK_SOFT } },
  maintenance: { label: "Maintenance", style: { background: "rgba(192,160,96,0.15)", color: "#C0A060" } },
};

const TYPE_LABELS: Record<string, string> = {
  villa:     "Villa",
  apartment: "Appartement",
  studio:    "Studio",
  house:     "Maison",
  room:      "Chambre",
};

const PLATFORM_COLORS: Record<string, React.CSSProperties> = {
  airbnb:  { background: "rgba(224,32,96,0.08)", color: "#C00040" },
  booking: { background: "rgba(59,130,246,0.1)", color: "#1d4ed8" },
  abritel: { background: "rgba(6,182,212,0.1)",  color: "#0891b2" },
  direct:  { background: "rgba(27,122,74,0.1)",  color: "#1B7A4A" },
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "maintenance">("all");

  useEffect(() => {
    fetch("/api/v1/properties")
      .then(r => r.json())
      .then(data => { setProperties(Array.isArray(data) ? data : []); })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? properties : properties.filter((p) => p.status === filter);
  const activeCount = properties.filter((p) => p.status === "active").length;
  const totalRevenue = properties.reduce((s, p) => s + (p.monthly_revenue || 0), 0);
  const avgOcc = properties.length
    ? Math.round(properties.filter((p) => p.status === "active").reduce((s, p) => s + (p.occupancy_rate || 0), 0) / Math.max(activeCount, 1))
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <p style={{ fontSize: 13, color: INK_SOFT }}>
          {properties.length} bien{properties.length !== 1 ? "s" : ""} · {activeCount} actif{activeCount !== 1 ? "s" : ""}
        </p>
        <Link
          href="/properties/new"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: INK, color: "#F4F2F0",
            borderRadius: 12, padding: "10px 18px",
            fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}
        >
          <Plus size={15} /> Ajouter un bien
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total biens",          value: properties.length,             icon: Home },
          { label: "Biens actifs",          value: activeCount,                   icon: TrendingUp },
          { label: "Revenus ce mois",       value: formatCurrency(totalRevenue),  icon: TrendingUp },
          { label: "Taux d'occupation moy", value: `${avgOcc}%`,                  icon: Moon },
        ].map((s, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
            padding: 18, display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: 40, height: 40, background: "rgba(224,32,96,0.08)", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <s.icon size={18} style={{ color: ROSE }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "active", "maintenance"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: filter === f ? "none" : "1px solid rgba(0,0,0,0.1)",
              background: filter === f ? INK : "white",
              color: filter === f ? "#F4F2F0" : INK_SOFT,
              cursor: "pointer",
            }}
          >
            {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Maintenance"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div className="h-44 animate-pulse" style={{ background: PAPER }} />
              <div className="p-4 space-y-2">
                <div className="h-4 animate-pulse" style={{ background: PAPER, borderRadius: 8 }} />
                <div className="h-3 animate-pulse w-2/3" style={{ background: PAPER, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "96px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <Home size={40} style={{ color: "rgba(0,0,0,0.15)", marginBottom: 16 }} />
          <h3 style={{ fontWeight: 700, color: INK, marginBottom: 4 }}>Aucun bien dans ce filtre</h3>
          <p style={{ color: INK_SOFT, fontSize: 13 }}>Essayez "Tous" pour voir l'ensemble de vos biens.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((p) => {
            const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.inactive;
            const occ = p.occupancy_rate ?? 0;
            return (
              <div
                key={p.id}
                style={{
                  background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
                  overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Image / placeholder */}
                <div style={{
                  height: 176, background: "linear-gradient(135deg, #F4F2F0, #E8E5E2)",
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Home size={48} style={{ color: "rgba(0,0,0,0.15)" }} />
                  {/* status badge */}
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                    padding: "4px 8px", borderRadius: 99,
                    ...st.style,
                  }}>
                    {st.label}
                  </span>
                  {/* type badge */}
                  <span style={{
                    position: "absolute", top: 12, right: 12,
                    fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 99,
                    background: "rgba(255,255,255,0.9)", color: INK,
                  }}>
                    {TYPE_LABELS[p.type] ?? p.type}
                  </span>
                  {/* occupancy overlay */}
                  {p.status === "active" && (
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                      padding: 12,
                    }}>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "white", borderRadius: 99, width: `${occ}%` }} />
                        </div>
                        <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>{occ}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontWeight: 700, color: INK, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
                  <div className="flex items-center gap-1" style={{ fontSize: 11, color: INK_SOFT, marginBottom: 12 }}>
                    <MapPin size={10} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.address}</span>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.bedrooms && (
                      <span style={{
                        fontSize: 10, background: "rgba(26,14,18,0.06)", color: INK_SOFT,
                        padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <BedDouble size={9} /> {p.bedrooms} ch.
                      </span>
                    )}
                    {p.max_guests && (
                      <span style={{
                        fontSize: 10, background: "rgba(26,14,18,0.06)", color: INK_SOFT,
                        padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Users size={9} /> {p.max_guests} pers.
                      </span>
                    )}
                    {(p.platforms ?? []).map((pl: string) => (
                      <span key={pl} style={{
                        fontSize: 10, padding: "3px 8px", borderRadius: 99, fontWeight: 700, textTransform: "capitalize",
                        ...(PLATFORM_COLORS[pl] ?? { background: "rgba(26,14,18,0.06)", color: INK_SOFT }),
                      }}>
                        {pl}
                      </span>
                    ))}
                  </div>

                  {/* KPIs */}
                  <div className="flex items-center gap-2 text-center" style={{
                    padding: "12px 0", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: INK_SOFT, marginBottom: 2 }}>Prix / nuit</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: ROSE }}>{p.base_price}€</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.06)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: INK_SOFT, marginBottom: 2 }}>Nuitées</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{p.nights_booked ?? "—"}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.06)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: INK_SOFT, marginBottom: 2 }}>Revenus</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{p.monthly_revenue ? `${(p.monthly_revenue / 1000).toFixed(1)}k€` : "—"}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${p.id}`}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        border: "1px solid rgba(0,0,0,0.1)", color: INK, fontWeight: 700,
                        padding: "8px 0", borderRadius: 10, textDecoration: "none", fontSize: 13,
                      }}
                    >
                      <Eye size={12} /> Voir
                    </Link>
                    <Link
                      href={`/properties/${p.id}/edit`}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        border: "1px solid rgba(0,0,0,0.1)", color: INK, fontWeight: 700,
                        padding: "8px 0", borderRadius: 10, textDecoration: "none", fontSize: 13,
                      }}
                    >
                      <Pencil size={12} /> Modifier
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

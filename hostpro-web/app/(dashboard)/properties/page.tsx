"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Plus, Home, MapPin, Users, BedDouble, TrendingUp, Moon, Eye, Pencil, Star } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:      { label: "Actif",        className: "bg-green-100 text-green-700" },
  inactive:    { label: "Inactif",      className: "bg-[#F7F7F7] text-[#717171]" },
  maintenance: { label: "Maintenance",  className: "bg-amber-100 text-amber-700" },
};

const TYPE_LABELS: Record<string, string> = {
  villa:      "Villa",
  apartment:  "Appartement",
  studio:     "Studio",
  house:      "Maison",
  room:       "Chambre",
};

const PLATFORM_COLORS: Record<string, string> = {
  airbnb:  "bg-[#FF5A5F]/10 text-[#FF5A5F]",
  booking: "bg-blue-100 text-blue-700",
  abritel: "bg-cyan-100 text-cyan-700",
  direct:  "bg-green-100 text-green-700",
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#717171]">
          {properties.length} bien{properties.length !== 1 ? "s" : ""} · {activeCount} actif{activeCount !== 1 ? "s" : ""}
        </p>
        <Link
          href="/properties/new"
          className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} /> Ajouter un bien
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total biens",         value: properties.length,                       icon: Home,       suffix: "" },
          { label: "Biens actifs",         value: activeCount,                             icon: TrendingUp, suffix: "" },
          { label: "Revenus ce mois",      value: formatCurrency(totalRevenue),            icon: TrendingUp, suffix: "" },
          { label: "Taux d'occupation moy", value: `${avgOcc}%`,                           icon: Moon,       suffix: "" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-[#FF5A5F]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#222222]">{s.value}</div>
              <div className="text-xs text-[#717171]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {(["all", "active", "maintenance"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? "bg-[#222222] text-white" : "bg-white border border-[#DDDDDD] text-[#717171] hover:text-[#222222]"
            }`}
          >
            {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Maintenance"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden shadow-sm">
              <div className="h-44 bg-[#F7F7F7] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#F7F7F7] rounded-xl animate-pulse" />
                <div className="h-3 bg-[#F7F7F7] rounded-xl animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] flex flex-col items-center justify-center py-24 shadow-sm">
          <Home size={40} className="text-[#DDDDDD] mb-4" />
          <h3 className="font-semibold text-[#222222] mb-1">Aucun bien dans ce filtre</h3>
          <p className="text-[#717171] text-sm">Essayez "Tous" pour voir l'ensemble de vos biens.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((p) => {
            const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.inactive;
            const occ = p.occupancy_rate ?? 0;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF5A5F]/30 transition-all group"
              >
                {/* Image / placeholder */}
                <div className="h-44 bg-gradient-to-br from-[#F7F7F7] to-[#EFEFEF] relative flex items-center justify-center overflow-hidden">
                  <Home size={48} className="text-[#DDDDDD] group-hover:scale-110 transition-transform duration-300" />
                  {/* status badge */}
                  <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold ${st.className}`}>
                    {st.label}
                  </span>
                  {/* type badge */}
                  <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium bg-white/80 text-[#222222]">
                    {TYPE_LABELS[p.type] ?? p.type}
                  </span>
                  {/* occupancy overlay */}
                  {p.status === "active" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${occ}%` }} />
                        </div>
                        <span className="text-white text-xs font-bold">{occ}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-[#222222] truncate mb-1">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-[#717171] mb-3">
                    <MapPin size={11} /> <span className="truncate">{p.address}</span>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.bedrooms && (
                      <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BedDouble size={10} /> {p.bedrooms} ch.
                      </span>
                    )}
                    {p.max_guests && (
                      <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users size={10} /> {p.max_guests} pers.
                      </span>
                    )}
                    {(p.platforms ?? []).map((pl: string) => (
                      <span key={pl} className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PLATFORM_COLORS[pl] ?? "bg-[#F7F7F7] text-[#717171]"}`}>
                        {pl}
                      </span>
                    ))}
                  </div>

                  {/* KPIs */}
                  <div className="flex items-center gap-2 py-3 border-t border-[#F7F7F7] mb-3 text-center">
                    <div className="flex-1">
                      <div className="text-[10px] text-[#717171] mb-0.5">Prix / nuit</div>
                      <div className="text-sm font-bold text-[#FF5A5F]">{p.base_price}€</div>
                    </div>
                    <div className="w-px h-8 bg-[#F7F7F7]" />
                    <div className="flex-1">
                      <div className="text-[10px] text-[#717171] mb-0.5">Nuitées</div>
                      <div className="text-sm font-bold text-[#222222]">{p.nights_booked ?? "—"}</div>
                    </div>
                    <div className="w-px h-8 bg-[#F7F7F7]" />
                    <div className="flex-1">
                      <div className="text-[10px] text-[#717171] mb-0.5">Revenus</div>
                      <div className="text-sm font-bold text-[#222222]">{p.monthly_revenue ? `${(p.monthly_revenue / 1000).toFixed(1)}k€` : "—"}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#DDDDDD] text-[#222222] font-semibold py-2 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm"
                    >
                      <Eye size={13} /> Voir
                    </Link>
                    <Link
                      href={`/properties/${p.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#DDDDDD] text-[#222222] font-semibold py-2 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm"
                    >
                      <Pencil size={13} /> Modifier
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

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { propertiesApi } from "@/lib/api";
import { Property } from "@/types";
import { formatCurrency, statusColor, propertyTypeLabel } from "@/lib/utils";
import { Plus, Home, MapPin, Users, BedDouble, TrendingUp, Moon, Eye, Pencil } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-green-100 text-green-700" },
  inactive: { label: "Inactif", className: "bg-[#F7F7F7] text-[#717171]" },
  maintenance: { label: "Maintenance", className: "bg-amber-100 text-amber-700" },
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi.list().then((r) => {
      setProperties(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeCount = properties.filter((p) => p.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#717171]">
            {properties.length} bien{properties.length !== 1 ? "s" : ""} géré{properties.length !== 1 ? "s" : ""} · {activeCount} actif{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} />
          Ajouter un bien
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total biens", value: properties.length, icon: Home },
          { label: "Biens actifs", value: activeCount, icon: TrendingUp },
          { label: "En maintenance", value: properties.filter((p) => p.status === "maintenance").length, icon: Home },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
              <stat.icon size={18} className="text-[#FF5A5F]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#222222]">{stat.value}</div>
              <div className="text-xs text-[#717171]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden shadow-sm">
              <div className="h-48 bg-[#F7F7F7] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#F7F7F7] rounded-xl animate-pulse" />
                <div className="h-3 bg-[#F7F7F7] rounded-xl animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-[#DDDDDD] flex flex-col items-center justify-center py-24 shadow-sm">
          <div className="w-16 h-16 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mb-4">
            <Home size={32} className="text-[#DDDDDD]" />
          </div>
          <h3 className="text-[#222222] font-semibold text-lg mb-2">Aucun bien encore</h3>
          <p className="text-[#717171] text-sm mb-6">Ajoutez votre premier bien pour commencer à gérer vos locations</p>
          <Link
            href="/dashboard/properties/new"
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
          >
            <Plus size={16} />
            Ajouter un bien
          </Link>
        </div>
      ) : (
        /* Property cards grid */
        <div className="grid grid-cols-3 gap-6">
          {properties.map((p) => {
            const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.inactive;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Image area */}
                <div className="h-48 bg-[#F7F7F7] relative overflow-hidden flex items-center justify-center">
                  {p.photos?.[0] ? (
                    <img
                      src={p.photos[0].url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Home size={40} className="text-[#DDDDDD]" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-[#222222] truncate">{p.name}</h3>
                    {p.city && (
                      <div className="flex items-center gap-1 text-xs text-[#717171] mt-1">
                        <MapPin size={11} />
                        {p.city}
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2.5 py-1 rounded-full">
                      {propertyTypeLabel(p.property_type)}
                    </span>
                    {p.bedrooms && (
                      <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <BedDouble size={11} /> {p.bedrooms} ch.
                      </span>
                    )}
                    {p.max_guests && (
                      <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Users size={11} /> {p.max_guests} pers.
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  {p.base_price_night && (
                    <div className="text-[#FF5A5F] font-bold text-base mb-3">
                      {formatCurrency(p.base_price_night)}
                      <span className="text-[#717171] text-xs font-normal"> / nuit</span>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#DDDDDD] mb-3">
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#717171]">Nuitées</div>
                      <div className="text-sm font-bold text-[#222222]">—</div>
                    </div>
                    <div className="w-px h-6 bg-[#DDDDDD]" />
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#717171]">Revenus</div>
                      <div className="text-sm font-bold text-[#222222]">—</div>
                    </div>
                    <div className="w-px h-6 bg-[#DDDDDD]" />
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#717171]">Taux occ.</div>
                      <div className="text-sm font-bold text-[#222222]">—</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/properties/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#DDDDDD] text-[#222222] font-semibold py-2 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm"
                    >
                      <Eye size={14} /> Voir
                    </Link>
                    <Link
                      href={`/dashboard/properties/${p.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#DDDDDD] text-[#222222] font-semibold py-2 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm"
                    >
                      <Pencil size={14} /> Modifier
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

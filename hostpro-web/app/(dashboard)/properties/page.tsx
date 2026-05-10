"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { propertiesApi } from "@/lib/api";
import { Property } from "@/types";
import { formatCurrency, statusColor, propertyTypeLabel } from "@/lib/utils";
import { Plus, Building2, MapPin, Users, BedDouble } from "lucide-react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi.list().then((r) => { setProperties(r.data); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes biens</h1>
          <p className="text-slate-500 text-sm mt-0.5">{properties.length} bien{properties.length > 1 ? "s" : ""} géré{properties.length > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} />
          Ajouter un bien
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-24">
          <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucun bien encore</p>
          <p className="text-slate-400 text-sm mt-1">Ajoutez votre premier bien pour commencer</p>
          <Link href="/dashboard/properties/new" className="inline-flex items-center gap-2 mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={15} /> Ajouter un bien
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {properties.map((p) => (
            <Link key={p.id} href={`/dashboard/properties/${p.id}`} className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {p.photos?.[0] ? (
                  <img src={p.photos[0].url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={32} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                    {p.status === "active" ? "Actif" : p.status === "inactive" ? "Inactif" : "Maintenance"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-900 group-hover:text-slate-700 truncate">{p.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{propertyTypeLabel(p.property_type)}</div>
                {p.city && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                    <MapPin size={11} />
                    {p.city}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={12} /> {p.max_guests} pers.
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <BedDouble size={12} /> {p.bedrooms} ch.
                  </div>
                  {p.base_price_night && (
                    <div className="ml-auto text-xs font-semibold text-slate-900">
                      {formatCurrency(p.base_price_night)}/nuit
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { propertiesApi } from "@/lib/api";
import { Property } from "@/types";
import { formatCurrency, propertyTypeLabel } from "@/lib/utils";
import {
  ArrowLeft, Home, MapPin, Users, BedDouble, Bath,
  Star, TrendingUp, Calendar, CheckSquare, Shield,
} from "lucide-react";

const TABS = [
  { id: "apercu", label: "Aperçu", icon: Home },
  { id: "reservations", label: "Réservations", icon: Calendar },
  { id: "taches", label: "Tâches", icon: CheckSquare },
  { id: "conformite", label: "Conformité", icon: Shield },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-green-100 text-green-700" },
  inactive: { label: "Inactif", className: "bg-[#F7F7F7] text-[#717171]" },
  maintenance: { label: "Maintenance", className: "bg-amber-100 text-amber-700" },
};

export function PropertyDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("apercu");

  useEffect(() => {
    propertiesApi.get(id).then((r) => {
      setProperty(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[#F7F7F7] rounded-xl animate-pulse w-48" />
        <div className="h-64 bg-white rounded-2xl border border-[#DDDDDD] animate-pulse shadow-sm" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-[#DDDDDD] animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl border border-[#DDDDDD] flex flex-col items-center justify-center py-24 shadow-sm">
        <Home size={40} className="text-[#DDDDDD] mb-4" />
        <h3 className="font-semibold text-[#222222] mb-2">Propriété introuvable</h3>
        <button
          onClick={() => router.back()}
          className="text-[#FF5A5F] font-medium hover:underline text-sm mt-2"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.inactive;

  return (
    <div>
      {/* Back + header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#717171] hover:text-[#222222] transition-colors text-sm font-medium mb-4"
      >
        <ArrowLeft size={16} /> Retour aux propriétés
      </button>

      {/* Hero section */}
      <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden mb-6">
        {/* Image */}
        <div className="h-56 bg-[#F7F7F7] relative flex items-center justify-center">
          {property.photos?.[0] ? (
            <img
              src={property.photos[0].url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Home size={48} className="text-[#DDDDDD]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{property.name}</h1>
              {property.city && (
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin size={13} />
                  {property.address || property.city}
                </div>
              )}
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Quick info row */}
        <div className="px-6 py-4 flex items-center gap-6 border-t border-[#DDDDDD]">
          <span className="text-xs bg-[#F7F7F7] text-[#717171] px-3 py-1.5 rounded-full font-medium">
            {propertyTypeLabel(property.property_type)}
          </span>
          {property.bedrooms && (
            <div className="flex items-center gap-1.5 text-sm text-[#717171]">
              <BedDouble size={16} className="text-[#FF5A5F]" />
              {property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""}
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1.5 text-sm text-[#717171]">
              <Bath size={16} className="text-[#FF5A5F]" />
              {property.bathrooms} salle{property.bathrooms > 1 ? "s" : ""} de bain
            </div>
          )}
          {property.max_guests && (
            <div className="flex items-center gap-1.5 text-sm text-[#717171]">
              <Users size={16} className="text-[#FF5A5F]" />
              {property.max_guests} personnes max.
            </div>
          )}
          {property.base_price_night && (
            <div className="ml-auto text-[#FF5A5F] font-bold">
              {formatCurrency(property.base_price_night)}
              <span className="text-[#717171] text-sm font-normal"> / nuit</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Nuitées (mois)", value: "—", icon: Calendar },
          { label: "Revenus (mois)", value: "—", icon: TrendingUp },
          { label: "Taux d'occupation", value: "—", icon: Star },
          { label: "Tâches en attente", value: "—", icon: CheckSquare },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-5 shadow-sm">
            <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center mb-3">
              <stat.icon size={18} className="text-[#FF5A5F]" />
            </div>
            <div className="text-2xl font-bold text-[#222222]">{stat.value}</div>
            <div className="text-xs text-[#717171] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-[#DDDDDD] rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-[#222222] text-white"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "apercu" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4">Réservations récentes</h3>
            <div className="flex flex-col items-center justify-center py-10 text-[#717171]">
              <Calendar size={32} className="text-[#DDDDDD] mb-2" />
              <p className="text-sm">Aucune réservation récente</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4">Tâches à venir</h3>
            <div className="flex flex-col items-center justify-center py-10 text-[#717171]">
              <CheckSquare size={32} className="text-[#DDDDDD] mb-2" />
              <p className="text-sm">Aucune tâche planifiée</p>
            </div>
          </div>
        </div>
      )}

      {tab === "reservations" && (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <h3 className="font-bold text-[#222222] mb-4">Toutes les réservations</h3>
          <div className="flex flex-col items-center justify-center py-16 text-[#717171]">
            <Calendar size={40} className="text-[#DDDDDD] mb-3" />
            <p className="font-medium text-[#222222]">Aucune réservation pour cette propriété</p>
          </div>
        </div>
      )}

      {tab === "taches" && (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <h3 className="font-bold text-[#222222] mb-4">Tâches liées à cette propriété</h3>
          <div className="flex flex-col items-center justify-center py-16 text-[#717171]">
            <CheckSquare size={40} className="text-[#DDDDDD] mb-3" />
            <p className="font-medium text-[#222222]">Aucune tâche pour cette propriété</p>
          </div>
        </div>
      )}

      {tab === "conformite" && (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <h3 className="font-bold text-[#222222] mb-4">Conformité de cette propriété</h3>
          <div className="flex flex-col items-center justify-center py-16 text-[#717171]">
            <Shield size={40} className="text-[#DDDDDD] mb-3" />
            <p className="font-medium text-[#222222]">Aucune donnée de conformité</p>
          </div>
        </div>
      )}
    </div>
  );
}

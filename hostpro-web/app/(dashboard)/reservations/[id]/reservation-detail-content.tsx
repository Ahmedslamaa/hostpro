"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reservationsApi, propertiesApi } from "@/lib/api";
import { withMock, MOCK_RESERVATIONS, MOCK_PROPERTIES } from "@/lib/mock";
import { Reservation, Property } from "@/types";
import { formatDate, formatCurrency, sourceLabel } from "@/lib/utils";
import {
  ArrowLeft, User, Calendar, Home, CreditCard,
  CheckCircle2, XCircle, Clock, MapPin,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700", icon: Clock },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700", icon: XCircle },
  completed: { label: "Terminée", className: "bg-[#F7F7F7] text-[#717171]", icon: CheckCircle2 },
  no_show: { label: "No-show", className: "bg-[#F7F7F7] text-[#717171]", icon: XCircle },
};

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  airbnb: { label: "Airbnb", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  booking: { label: "Booking.com", className: "bg-blue-100 text-blue-700" },
  manual: { label: "Direct", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  direct: { label: "Direct", className: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  abritel: { label: "Abritel", className: "bg-cyan-100 text-cyan-700" },
};

export function ReservationDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      withMock(() => reservationsApi.get(id), MOCK_RESERVATIONS.find((r) => r.id === id) ?? MOCK_RESERVATIONS[0]),
      withMock(() => propertiesApi.list(), MOCK_PROPERTIES),
    ]).then(([r, p]) => {
      setReservation((r ?? MOCK_RESERVATIONS[0]) as any);
      setProperties((Array.isArray(p) ? p : MOCK_PROPERTIES) as any[]);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[#F7F7F7] rounded-xl animate-pulse w-48" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-2xl border border-[#DDDDDD] animate-pulse shadow-sm" />
          <div className="h-64 bg-white rounded-2xl border border-[#DDDDDD] animate-pulse shadow-sm" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="bg-white rounded-2xl border border-[#DDDDDD] flex flex-col items-center justify-center py-24 shadow-sm">
        <Calendar size={40} className="text-[#DDDDDD] mb-4" />
        <h3 className="font-semibold text-[#222222] mb-2">Réservation introuvable</h3>
        <button
          onClick={() => router.back()}
          className="text-[#FF5A5F] font-medium hover:underline text-sm mt-2"
        >
          Retour aux réservations
        </button>
      </div>
    );
  }

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p]));
  const property = propMap[reservation.property_id];
  const statusCfg = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending;
  const sourceCfg = SOURCE_CONFIG[reservation.source] || {
    label: sourceLabel(reservation.source),
    className: "bg-[#F7F7F7] text-[#717171]",
  };
  const StatusIcon = statusCfg.icon;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#717171] hover:text-[#222222] transition-colors text-sm font-medium mb-4"
      >
        <ArrowLeft size={16} /> Retour aux réservations
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#222222]">
            Réservation #{id.slice(0, 8).toUpperCase()}
          </h1>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${statusCfg.className}`}>
            <StatusIcon size={13} />
            {statusCfg.label}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${sourceCfg.className}`}>
            {sourceCfg.label}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Guest info */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-[#FF5A5F]/10 rounded-lg flex items-center justify-center">
                <User size={14} className="text-[#FF5A5F]" />
              </div>
              Voyageur
            </h3>
            {(() => {
              const r = reservation as any;
              const name = r.guest_name || r.guest?.full_name || "—";
              const email = r.guest_email || r.guest?.email;
              const phone = r.guest_phone || r.guest?.phone;
              return (
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#FF5A5F] text-lg font-bold">{name[0]?.toUpperCase() ?? "?"}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#222222]">{name}</div>
                    {email && <div className="text-sm text-[#717171]">{email}</div>}
                    {phone && <div className="text-sm text-[#717171]">{phone}</div>}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-[#FF5A5F]/10 rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-[#FF5A5F]" />
              </div>
              Dates du séjour
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F7F7] rounded-xl p-4">
                <div className="text-xs text-[#717171] font-semibold uppercase tracking-wide mb-1">Check-in</div>
                <div className="font-bold text-[#222222]">{formatDate(reservation.check_in)}</div>
              </div>
              <div className="bg-[#F7F7F7] rounded-xl p-4">
                <div className="text-xs text-[#717171] font-semibold uppercase tracking-wide mb-1">Check-out</div>
                <div className="font-bold text-[#222222]">{formatDate(reservation.check_out)}</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-[#717171]">
              <span className="font-semibold text-[#222222]">{reservation.nights}</span> nuit
              {reservation.nights > 1 ? "s" : ""} au total
            </div>
          </div>

          {/* Property */}
          {property && (
            <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
              <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
                <div className="w-7 h-7 bg-[#FF5A5F]/10 rounded-lg flex items-center justify-center">
                  <Home size={14} className="text-[#FF5A5F]" />
                </div>
                Propriété
              </h3>
              <div className="font-semibold text-[#222222]">{property.name}</div>
              {property.city && (
                <div className="flex items-center gap-1.5 text-sm text-[#717171] mt-1">
                  <MapPin size={13} />
                  {property.address || property.city}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Price breakdown */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-[#FF5A5F]/10 rounded-lg flex items-center justify-center">
                <CreditCard size={14} className="text-[#FF5A5F]" />
              </div>
              Détail financier
            </h3>
            <div className="space-y-3">
              {[
                { label: "Prix total", value: (reservation as any).total_price || reservation.total_amount ? formatCurrency((reservation as any).total_price ?? reservation.total_amount) : "—" },
                { label: "Frais de ménage", value: (reservation as any).cleaning_fee ? formatCurrency((reservation as any).cleaning_fee) : "Inclus" },
                { label: "Revenu net", value: (reservation as any).net_revenue ? formatCurrency((reservation as any).net_revenue) : (reservation as any).total_price ? formatCurrency(Math.round((reservation as any).total_price * 0.87)) : "—", bold: true, coral: true },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between items-center ${i === 2 ? "pt-3 border-t border-[#DDDDDD]" : ""}`}>
                  <span className={`text-sm ${row.bold ? "font-bold text-[#222222]" : "text-[#717171]"}`}>
                    {row.label}
                  </span>
                  <span className={`text-sm font-bold ${row.coral ? "text-[#FF5A5F]" : "text-[#222222]"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold py-3 rounded-xl transition-all text-sm">
                <CheckCircle2 size={16} /> Confirmer le check-in
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-[#DDDDDD] text-[#222222] font-semibold py-3 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm">
                <CheckCircle2 size={16} /> Confirmer le check-out
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition-all text-sm">
                <XCircle size={16} /> Annuler la réservation
              </button>
            </div>
          </div>

          {/* Linked tasks */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h3 className="font-bold text-[#222222] mb-4">Tâches liées</h3>
            <div className="flex flex-col items-center justify-center py-8 text-[#717171]">
              <CheckCircle2 size={28} className="text-[#DDDDDD] mb-2" />
              <p className="text-sm">Aucune tâche liée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

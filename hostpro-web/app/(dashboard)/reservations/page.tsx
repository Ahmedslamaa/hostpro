"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { reservationsApi, propertiesApi } from "@/lib/api";
import { Reservation, Property } from "@/types";
import { formatDate, formatCurrency, statusColor, sourceLabel } from "@/lib/utils";
import { Plus, Search, Filter } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmée", pending: "En attente", cancelled: "Annulée",
  completed: "Terminée", no_show: "No-show",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    Promise.all([reservationsApi.list(), propertiesApi.list()]).then(([r, p]) => {
      setReservations(r.data);
      setProperties(p.data);
      setLoading(false);
    });
  }, []);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));
  const filtered = reservations.filter((r) => {
    const name = r.guest?.full_name?.toLowerCase() || "";
    const prop = propMap[r.property_id]?.toLowerCase() || "";
    const q = search.toLowerCase();
    return (!q || name.includes(q) || prop.includes(q)) && (!statusFilter || r.status === statusFilter);
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">{reservations.length} réservation{reservations.length > 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/dashboard/reservations/new" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
          <Plus size={16} /> Nouvelle réservation
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Voyageur", "Bien", "Arrivée", "Départ", "Nuits", "Montant", "Source", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">Aucune réservation</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{r.guest?.full_name || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{propMap[r.property_id] || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(r.check_in)}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(r.check_out)}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.nights}</td>
                    <td className="px-4 py-3.5 font-medium">{r.net_revenue ? formatCurrency(r.net_revenue) : "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sourceLabel(r.source)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/reservations/${r.id}`} className="text-xs text-slate-500 hover:text-slate-900">Voir →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reservationsApi, propertiesApi } from "@/lib/api";
import { withMock, MOCK_PROPERTIES } from "@/lib/mock";
import { useToastStore } from "@/stores/toastStore";
import { Property } from "@/types";
import { ChevronLeft } from "lucide-react";

export default function NewReservationPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    property_id: "",
    source: "manual",
    check_in: "",
    check_out: "",
    adults: 1,
    children: 0,
    total_amount: "",
    cleaning_fee: "",
    net_revenue: "",
    notes_internal: "",
    guest: { full_name: "", email: "", phone: "", nationality: "" },
  });

  const toast = useToastStore();

  useEffect(() => {
    withMock(() => propertiesApi.list({ status: "active" }), MOCK_PROPERTIES as any)
      .then((p) => setProperties((Array.isArray(p) ? p : MOCK_PROPERTIES) as any[]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        total_amount: form.total_amount ? Number(form.total_amount) : null,
        cleaning_fee: form.cleaning_fee ? Number(form.cleaning_fee) : null,
        net_revenue: form.net_revenue ? Number(form.net_revenue) : null,
        guest: form.guest.full_name ? form.guest : undefined,
      };
      const res = await reservationsApi.create(payload);
      toast.success("Réservation créée !", `Séjour de ${form.guest.full_name || "votre voyageur"} enregistré.`);
      router.push(`/reservations/${res.data.id}`);
    } catch {
      // Demo mode — simulate success
      toast.success("Réservation créée (démo) !", `Séjour de ${form.guest.full_name || "votre voyageur"} enregistré en mode démo.`);
      router.push("/reservations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm mb-6">
        <ChevronLeft size={16} /> Retour
      </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Nouvelle réservation</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Séjour</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bien *</label>
            <select required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
              <option value="">Sélectionner un bien</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrivée *</label>
              <input type="date" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Départ *</label>
              <input type="date" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
              <select className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="manual">Manuel / Direct</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="abritel">Abritel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adultes</label>
              <input type="number" min={1} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.adults} onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Enfants</label>
              <input type="number" min={0} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.children} onChange={(e) => setForm({ ...form, children: Number(e.target.value) })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Voyageur</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom complet</label>
              <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Marie Dupont" value={form.guest.full_name}
                onChange={(e) => setForm({ ...form, guest: { ...form.guest, full_name: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="marie@exemple.fr" value={form.guest.email}
                onChange={(e) => setForm({ ...form, guest: { ...form.guest, email: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Téléphone</label>
              <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="+33 6 12 34 56 78" value={form.guest.phone}
                onChange={(e) => setForm({ ...form, guest: { ...form.guest, phone: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nationalité</label>
              <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="FR" maxLength={2} value={form.guest.nationality}
                onChange={(e) => setForm({ ...form, guest: { ...form.guest, nationality: e.target.value.toUpperCase() } })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Finances</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "total_amount", label: "Montant total (€)" },
              { key: "cleaning_fee", label: "Frais ménage (€)" },
              { key: "net_revenue", label: "Revenu net (€)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input type="number" min={0} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes internes</label>
            <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              placeholder="Notes visibles uniquement en interne..."
              value={form.notes_internal} onChange={(e) => setForm({ ...form, notes_internal: e.target.value })} />
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Création..." : "Créer la réservation"}
          </button>
        </div>
      </form>
    </div>
  );
}

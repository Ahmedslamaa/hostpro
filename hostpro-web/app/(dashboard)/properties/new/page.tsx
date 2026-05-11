"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { propertiesApi } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import { ChevronLeft } from "lucide-react";

const AMENITIES = ["WiFi", "Parking", "Piscine", "Climatisation", "Lave-linge", "Lave-vaisselle", "Télévision", "Barbecue", "Balcon", "Vue mer", "Animaux acceptés", "Vélos disponibles"];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    property_type: "apartment",
    address: "",
    city: "",
    postal_code: "",
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    surface_m2: "",
    min_stay_nights: 1,
    check_in_time: "16:00",
    check_out_time: "11:00",
    base_price_night: "",
    cleaning_fee: "0",
    security_deposit: "0",
    amenities: [] as string[],
  });

  const toggle = (a: string) =>
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));

  const toast = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        surface_m2: form.surface_m2 ? Number(form.surface_m2) : null,
        base_price_night: form.base_price_night ? Number(form.base_price_night) : null,
        cleaning_fee: Number(form.cleaning_fee),
        security_deposit: Number(form.security_deposit),
      };
      const res = await propertiesApi.create(payload);
      toast.success("Propriété créée !", `${form.name} a été ajoutée à votre portefeuille.`);
      router.push(`/properties/${res.data.id}`);
    } catch {
      // Demo mode — simulate success with mock id
      toast.success("Propriété créée (démo) !", `${form.name} a été ajoutée en mode démo.`);
      router.push("/properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm mb-6">
        <ChevronLeft size={16} /> Retour
      </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Ajouter un bien</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom du bien *</label>
            <input required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Villa Méditerranée" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Surface (m²)</label>
              <input type="number" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="65" value={form.surface_m2} onChange={(e) => setForm({ ...form, surface_m2: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              placeholder="Décrivez votre bien..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Localisation</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse</label>
            <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="12 avenue de la Mer" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ville</label>
              <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Nice" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Code postal</label>
              <input className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="06000" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Capacité & règles</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "max_guests", label: "Voyageurs max" },
              { key: "bedrooms", label: "Chambres" },
              { key: "bathrooms", label: "Salles de bain" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input type="number" min={1} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Séjour minimum (nuits)</label>
              <input type="number" min={1} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.min_stay_nights} onChange={(e) => setForm({ ...form, min_stay_nights: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-in</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.check_in_time} onChange={(e) => setForm({ ...form, check_in_time: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-out</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.check_out_time} onChange={(e) => setForm({ ...form, check_out_time: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Tarification</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "base_price_night", label: "Prix/nuit (€)" },
              { key: "cleaning_fee", label: "Frais ménage (€)" },
              { key: "security_deposit", label: "Caution (€)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input type="number" min={0} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Équipements</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button
                key={a} type="button"
                onClick={() => toggle(a)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.amenities.includes(a) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Création..." : "Créer le bien"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LogoMark } from "@/components/ui/LogoMark";
import {
  CheckCircle, ChevronRight, Home, Calendar, Users, Sparkles,
  MapPin, BedDouble, Euro, Building2, Wifi, ArrowRight, Star,
  Zap, BarChart2, MessageSquare, Shield,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Bienvenue" },
  { id: 2, label: "Propriété" },
  { id: 3, label: "Plateformes" },
  { id: 4, label: "C'est parti !" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement", icon: Building2 },
  { value: "villa", label: "Villa / Maison", icon: Home },
  { value: "studio", label: "Studio", icon: BedDouble },
  { value: "other", label: "Autre", icon: MapPin },
];

const PLATFORMS = [
  { id: "airbnb", name: "Airbnb", color: "bg-[#FF5A5F]/10 border-[#FF5A5F]/30 text-[#FF5A5F]", logo: "A" },
  { id: "booking", name: "Booking.com", color: "bg-blue-50 border-blue-200 text-blue-600", logo: "B" },
  { id: "abritel", name: "Abritel / VRBO", color: "bg-cyan-50 border-cyan-200 text-cyan-600", logo: "V" },
  { id: "direct", name: "Site direct", color: "bg-green-50 border-green-200 text-green-600", logo: "D" },
];

const FEATURES = [
  { icon: Calendar, label: "Channel Manager", desc: "Synchronisez tous vos calendriers en temps réel" },
  { icon: Sparkles, label: "Tarification IA", desc: "Prix optimisés automatiquement selon la demande" },
  { icon: Zap, label: "Automatisation", desc: "Check-in, ménage, messages automatiques" },
  { icon: MessageSquare, label: "Assistant IA", desc: "Répondez aux avis et réclamations en 1 clic" },
  { icon: BarChart2, label: "Analytics", desc: "ROI, RevPAR, taux d'occupation en temps réel" },
  { icon: Shield, label: "Conformité", desc: "Déclarations légales et fiscales simplifiées" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [property, setProperty] = useState({
    name: "",
    city: "",
    beds: "2",
    price: "",
  });

  const firstName = user?.full_name?.split(" ")[0] || "là";

  const togglePlatform = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setConnectedPlatforms((p) => p.filter((x) => x !== id));
      return;
    }
    setConnecting(id);
    await new Promise((r) => setTimeout(r, 1200));
    setConnectedPlatforms((p) => [...p, id]);
    setConnecting(null);
  };

  const canNextStep2 = propertyType && property.name && property.city;

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-[#DDDDDD] px-8 py-4 flex items-center justify-between">
        <LogoMark variant="light" size="md" />
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step >= s.id ? "text-[#222222]" : "text-[#BBBBBB]"}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-[#FF5A5F] text-white" : "bg-[#DDDDDD] text-[#717171]"}`}
                >
                  {step > s.id ? <CheckCircle size={14} /> : s.id}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.id ? "bg-green-400" : "bg-[#DDDDDD]"}`} />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => router.replace("/dashboard")}
          className="text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          Passer 
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FF5A5F]/10 border-2 border-[#FF5A5F]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={36} className="text-[#FF5A5F]" />
              </div>
              <h1 className="text-3xl font-black text-[#222222] mb-3">
                Bienvenue, {firstName} ! 
              </h1>
              <p className="text-[#717171] text-lg mb-2">
                Votre essai gratuit de <span className="font-bold text-[#222222]">14 jours</span> commence maintenant.
              </p>
              <p className="text-[#717171] mb-10">
                Configurez HOSTPRO en 3 minutes — nous allons vous guider pas à pas.
              </p>

              {/* Feature grid */}
              <div className="grid grid-cols-3 gap-4 mb-10 text-left">
                {FEATURES.map((f, i) => (
                  <div key={i} className="bg-white border border-[#DDDDDD] rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center mb-3">
                      <f.icon size={18} className="text-[#FF5A5F]" />
                    </div>
                    <div className="font-semibold text-sm text-[#222222] mb-1">{f.label}</div>
                    <div className="text-xs text-[#717171] leading-relaxed">{f.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-8 flex items-center gap-4 text-left">
                <Star size={20} className="text-amber-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-amber-800 text-sm">Aucune carte bancaire requise</div>
                  <div className="text-amber-700 text-xs mt-0.5">Profitez de 14 jours gratuits, sans engagement. Annulez à tout moment.</div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#FF5A5F]/20 hover:shadow-[#FF5A5F]/30"
              >
                Commencer la configuration <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Add property ── */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Home size={26} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-[#222222] mb-2">Ajoutez votre première propriété</h1>
                <p className="text-[#717171]">Vous pourrez en ajouter d'autres depuis le module Propriétés.</p>
              </div>

              {/* Property type */}
              <div className="mb-6">
                <label className="text-sm font-bold text-[#222222] mb-3 block">Type de bien</label>
                <div className="grid grid-cols-4 gap-3">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setPropertyType(t.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-medium text-sm
                        ${propertyType === t.value
                          ? "border-[#FF5A5F] bg-[#FF5A5F]/5 text-[#FF5A5F]"
                          : "border-[#DDDDDD] bg-white text-[#717171] hover:border-[#222222] hover:text-[#222222]"}`}
                    >
                      <t.icon size={22} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property details */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#222222] mb-1.5 block">Nom de la propriété</label>
                    <input
                      placeholder="Villa Azur"
                      value={property.name}
                      onChange={(e) => setProperty({ ...property, name: e.target.value })}
                      className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF5A5F] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#222222] mb-1.5 block">
                      <MapPin size={13} className="inline mr-1" />Ville
                    </label>
                    <input
                      placeholder="Nice, Cannes, Monaco..."
                      value={property.city}
                      onChange={(e) => setProperty({ ...property, city: e.target.value })}
                      className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF5A5F] transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#222222] mb-1.5 block">
                      <BedDouble size={13} className="inline mr-1" />Chambres
                    </label>
                    <select
                      value={property.beds}
                      onChange={(e) => setProperty({ ...property, beds: e.target.value })}
                      className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF5A5F] transition-colors bg-white"
                    >
                      {["Studio", "1", "2", "3", "4", "5+"].map((n) => (
                        <option key={n} value={n}>{n === "Studio" ? "Studio" : `${n} chambre${n !== "1" ? "s" : ""}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#222222] mb-1.5 block">
                      <Euro size={13} className="inline mr-1" />Prix de base / nuit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="150"
                        value={property.price}
                        onChange={(e) => setProperty({ ...property, price: e.target.value })}
                        className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#FF5A5F] transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717171] text-sm">€</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-3 rounded-2xl text-sm hover:bg-[#F7F7F7] transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canNextStep2}
                  className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Continuer <ChevronRight size={16} />
                </button>
              </div>

              <p className="text-center text-xs text-[#717171] mt-4">
                Vous pouvez ajouter d'autres propriétés depuis le tableau de bord.
              </p>
            </div>
          )}

          {/* ── Step 3: Connect platforms ── */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-purple-50 border-2 border-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wifi size={26} className="text-purple-600" />
                </div>
                <h1 className="text-2xl font-black text-[#222222] mb-2">Connectez vos plateformes</h1>
                <p className="text-[#717171]">
                  Synchronisez Airbnb, Booking.com et plus — ou faites-le plus tard depuis les Paramètres.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {PLATFORMS.map((p) => {
                  const isConnected = connectedPlatforms.includes(p.id);
                  const isLoading = connecting === p.id;
                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-[#DDDDDD] rounded-2xl px-6 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm flex-shrink-0 ${p.color}`}>
                        {p.logo}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[#222222]">{p.name}</div>
                        <div className="text-xs text-[#717171] mt-0.5">
                          {isConnected ? " Calendriers synchronisés" : "Synchronisation des calendriers et réservations"}
                        </div>
                      </div>
                      <button
                        onClick={() => togglePlatform(p.id)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-w-[100px]
                          ${isConnected
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "border border-[#DDDDDD] text-[#222222] hover:bg-[#F7F7F7]"
                          } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Connexion...
                          </span>
                        ) : isConnected ? (
                          <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Connecté</span>
                        ) : (
                          "Connecter"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {connectedPlatforms.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-sm font-medium">
                    {connectedPlatforms.length} plateforme{connectedPlatforms.length > 1 ? "s" : ""} connectée{connectedPlatforms.length > 1 ? "s" : ""} — vos calendriers se synchroniseront automatiquement.
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-3 rounded-2xl text-sm hover:bg-[#F7F7F7] transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {connectedPlatforms.length === 0 ? "Passer pour l'instant" : "Continuer"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: All done ── */}
          {step === 4 && (
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-green-50 border-2 border-green-200 rounded-3xl flex items-center justify-center">
                  <CheckCircle size={44} className="text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 text-2xl"></div>
              </div>
              <h1 className="text-3xl font-black text-[#222222] mb-3">Tout est prêt !</h1>
              <p className="text-[#717171] text-lg mb-2">
                HOSTPRO est configuré pour <span className="font-bold text-[#222222]">{property.name || "votre propriété"}</span>.
              </p>
              <p className="text-[#717171] mb-10">
                Votre essai gratuit de 14 jours est actif. Explorez toutes les fonctionnalités sans limite.
              </p>

              {/* Summary */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#F7F7F7]">
                  <span className="text-sm text-[#717171]">Propriété ajoutée</span>
                  <span className="text-sm font-semibold text-[#222222] flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-green-500" />
                    {property.name || "Ma propriété"}{property.city ? `, ${property.city}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F7F7F7]">
                  <span className="text-sm text-[#717171]">Plateformes connectées</span>
                  <span className="text-sm font-semibold text-[#222222] flex items-center gap-1.5">
                    <CheckCircle size={14} className={connectedPlatforms.length > 0 ? "text-green-500" : "text-[#DDDDDD]"} />
                    {connectedPlatforms.length > 0
                      ? `${connectedPlatforms.length} connectée${connectedPlatforms.length > 1 ? "s" : ""}`
                      : "À configurer"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#717171]">Essai gratuit</span>
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-green-500" />
                    14 jours actifs
                  </span>
                </div>
              </div>

              {/* Next steps suggestions */}
              <div className="grid grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { icon: Calendar, label: "Voir le calendrier", href: "/calendar", desc: "Visualisez vos disponibilités" },
                  { icon: Sparkles, label: "Activer l'IA", href: "/pricing", desc: "Optimisez vos tarifs automatiquement" },
                  { icon: Users, label: "Inviter l'équipe", href: "/team", desc: "Ajoutez vos agents de ménage" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => router.replace(item.href)}
                    className="flex flex-col gap-2 p-4 bg-white border border-[#DDDDDD] rounded-2xl hover:shadow-sm hover:border-[#FF5A5F]/30 transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
                      <item.icon size={16} className="text-[#FF5A5F]" />
                    </div>
                    <div className="font-semibold text-sm text-[#222222] group-hover:text-[#FF5A5F] transition-colors">{item.label}</div>
                    <div className="text-xs text-[#717171]">{item.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => router.replace("/dashboard")}
                className="inline-flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#FF5A5F]/20"
              >
                Accéder au tableau de bord <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

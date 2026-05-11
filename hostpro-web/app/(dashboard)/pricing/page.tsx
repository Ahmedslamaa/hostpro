"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Zap, Calendar, Settings, RefreshCw, ChevronUp, ChevronDown, Info } from "lucide-react";

const properties = [
  { id: 1, name: "Villa Azur", city: "Nice", basePrice: 185, currentPrice: 220, aiPrice: 245, occupancy: 87, trend: "up", change: +11, season: "haute" },
  { id: 2, name: "Apt. Bellevue", city: "Cannes", basePrice: 120, currentPrice: 138, aiPrice: 162, occupancy: 84, trend: "up", change: +17, season: "haute" },
  { id: 3, name: "Studio Antibes", city: "Antibes", basePrice: 75, currentPrice: 75, aiPrice: 88, occupancy: 79, trend: "up", change: +17, season: "normale" },
  { id: 4, name: "Villa Provence", city: "Grasse", basePrice: 210, currentPrice: 195, aiPrice: 178, occupancy: 62, trend: "down", change: -7, season: "basse" },
  { id: 5, name: "Penthouse Côte", city: "Monaco", basePrice: 450, currentPrice: 520, aiPrice: 610, occupancy: 91, trend: "up", change: +17, season: "haute" },
];

const events = [
  { date: "14-17 Mai", name: "Festival Jazz Nice", impact: "+35%", color: "bg-green-100 text-green-700" },
  { date: "16-27 Mai", name: "Festival de Cannes", impact: "+85%", color: "bg-[#FF5A5F]/10 text-[#FF5A5F]" },
  { date: "24 Mai", name: "Week-end férié", impact: "+25%", color: "bg-amber-100 text-amber-700" },
  { date: "1-30 Juin", name: "Début saison été", impact: "+45%", color: "bg-blue-100 text-blue-700" },
  { date: "8 Jun", name: "Grand Prix Monaco", impact: "+120%", color: "bg-purple-100 text-purple-700" },
];

const weekData = [
  { day: "Lun", rate: 65 }, { day: "Mar", rate: 58 }, { day: "Mer", rate: 70 },
  { day: "Jeu", rate: 75 }, { day: "Ven", rate: 92 }, { day: "Sam", rate: 98 }, { day: "Dim", rate: 88 },
];

export default function PricingPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedProp, setSelectedProp] = useState(properties[0]);
  const [applyingAll, setApplyingAll] = useState(false);

  const handleApplyAll = () => {
    setApplyingAll(true);
    setTimeout(() => setApplyingAll(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">Tarification Dynamique</h1>
          <p className="text-sm text-[#717171] mt-0.5">IA + données marché en temps réel · Côte d'Azur</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${aiEnabled ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm font-medium text-[#222222]">IA Pricing</span>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${aiEnabled ? "bg-[#FF5A5F]" : "bg-[#DDDDDD]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <button
            onClick={handleApplyAll}
            disabled={applyingAll}
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Zap size={15} />
            {applyingAll ? "Application..." : "Appliquer les prix IA"}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Revenu potentiel", value: "+18 400 €", sub: "ce mois avec IA", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Prix moyen actuel", value: "228 €", sub: "par nuit / tous biens", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Prix moyen IA", value: "257 €", sub: "+12.7% recommandé", icon: Zap, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10" },
          { label: "Opportunités", value: "3 biens", sub: "prix sous-optimaux", icon: Info, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#717171] font-medium">{k.label}</span>
              <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center`}>
                <k.icon size={16} className={k.color} />
              </div>
            </div>
            <div className={`text-2xl font-black ${k.color} mb-0.5`}>{k.value}</div>
            <div className="text-xs text-[#717171]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Properties pricing table */}
        <div className="col-span-2 bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DDDDDD] flex items-center justify-between">
            <h2 className="font-bold text-[#222222]">Prix par propriété</h2>
            <span className="text-xs text-[#717171]">Basé sur événements + saisonnalité + concurrence</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F7F7]">
                {["Propriété", "Prix base", "Prix actuel", "Prix IA", "Occupation", "Tendance", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProp(p)}
                  className={`border-b border-[#F7F7F7] hover:bg-[#F7F7F7]/50 cursor-pointer transition-colors ${selectedProp.id === p.id ? "bg-[#FF5A5F]/5" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-sm text-[#222222]">{p.name}</div>
                    <div className="text-xs text-[#717171]">{p.city}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#717171]">{p.basePrice} €</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#222222]">{p.currentPrice} €</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-black text-[#FF5A5F]">{p.aiPrice} €</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#F7F7F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF5A5F] rounded-full" style={{ width: `${p.occupancy}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[#222222]">{p.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${p.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                      {p.trend === "up" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {p.change > 0 ? "+" : ""}{p.change}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs font-semibold text-[#FF5A5F] hover:underline">Appliquer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Events */}
          <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
            <h3 className="font-bold text-sm text-[#222222] mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-[#FF5A5F]" />
              Événements à venir
            </h3>
            <div className="space-y-2.5">
              {events.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#222222]">{e.name}</div>
                    <div className="text-xs text-[#717171]">{e.date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.color}`}>{e.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly demand */}
          <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
            <h3 className="font-bold text-sm text-[#222222] mb-4">Demande par jour</h3>
            <div className="flex items-end gap-1.5 h-20">
              {weekData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-[#FF5A5F]/20 hover:bg-[#FF5A5F]/40 transition-colors"
                    style={{ height: `${d.rate * 0.7}px` }}
                  />
                  <span className="text-xs text-[#717171]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected property detail */}
          <div className="bg-[#FF5A5F]/5 border border-[#FF5A5F]/20 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-[#FF5A5F] mb-3 flex items-center gap-2">
              <Zap size={14} />
              {selectedProp.name} — Recommandation IA
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#717171]">Prix actuel</span>
                <span className="font-semibold">{selectedProp.currentPrice} €/nuit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#717171]">Prix IA optimal</span>
                <span className="font-black text-[#FF5A5F]">{selectedProp.aiPrice} €/nuit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#717171]">Gain estimé/mois</span>
                <span className="font-semibold text-green-600">+{Math.round((selectedProp.aiPrice - selectedProp.currentPrice) * 15)} €</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#FF5A5F]/20">
                <p className="text-xs text-[#717171] leading-relaxed">
                  Basé sur Festival de Cannes (+85%), saisonnalité haute et taux d'occupation à {selectedProp.occupancy}%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

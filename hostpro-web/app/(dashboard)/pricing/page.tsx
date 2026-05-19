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
  { date: "16-27 Mai", name: "Festival de Cannes", impact: "+85%", color: "bg-primary-500/10 text-primary-600" },
  { date: "24 Mai", name: "Week-end férié", impact: "+25%", color: "bg-amber-100 text-amber-700" },
  { date: "1-30 Juin", name: "Début saison été", impact: "+45%", color: "bg-blue-100 text-blue-700" },
  { date: "8 Jun", name: "Grand Prix Monaco", impact: "+120%", color: "bg-purple-100 text-purple-700" },
];

const weekData = [
  { day: "Lun", rate: 65 }, { day: "Mar", rate: 58 }, { day: "Mer", rate: 70 },
  { day: "Jeu", rate: 75 }, { day: "Ven", rate: 92 }, { day: "Sam", rate: 98 }, { day: "Dim", rate: 88 },
];

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

export default function PricingPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedProp, setSelectedProp] = useState(properties[0]);
  const [applyingAll, setApplyingAll] = useState(false);

  const handleApplyAll = () => {
    setApplyingAll(true);
    setTimeout(() => setApplyingAll(false), 1800);
  };

  const monoLabel: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em", textTransform: "uppercase" as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Tarification Dynamique</h1>
          <p style={{ fontSize: 13, color: INK_SOFT, marginTop: 2 }}>IA + données marché en temps réel · Côte d'Azur</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" style={{ background: PAPER, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "8px 14px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: aiEnabled ? "#1B7A4A" : "#9ca3af" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>IA Pricing</span>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              style={{ position: "relative", width: 40, height: 20, borderRadius: 99, border: "none", cursor: "pointer", background: aiEnabled ? ROSE : "rgba(0,0,0,0.15)" }}
            >
              <div style={{
                position: "absolute", top: 2, width: 16, height: 16, background: "white", borderRadius: "50%",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.2s",
                transform: aiEnabled ? "translateX(22px)" : "translateX(2px)",
              }} />
            </button>
          </div>
          <button
            onClick={handleApplyAll}
            disabled={applyingAll}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: ROSE, color: "white", fontSize: 13, fontWeight: 700,
              padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer",
              opacity: applyingAll ? 0.7 : 1,
            }}
          >
            <Zap size={14} />
            {applyingAll ? "Application..." : "Appliquer les prix IA"}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Revenu potentiel", value: "+18 400 €", sub: "ce mois avec IA", icon: TrendingUp, color: "#1B7A4A", bg: "rgba(27,122,74,0.1)" },
          { label: "Prix moyen actuel", value: "228 €", sub: "par nuit / tous biens", icon: Calendar, color: "#1d4ed8", bg: "rgba(59,130,246,0.1)" },
          { label: "Prix moyen IA", value: "257 €", sub: "+12.7% recommandé", icon: Zap, color: "#C00040", bg: "rgba(224,32,96,0.08)" },
          { label: "Opportunités", value: "3 biens", sub: "prix sous-optimaux", icon: Info, color: "#C0A060", bg: "rgba(192,160,96,0.15)" },
        ].map((k, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 11, color: INK_SOFT, fontWeight: 600 }}>{k.label}</span>
              <div style={{ width: 32, height: 32, background: k.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginBottom: 2, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: INK_SOFT }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Properties pricing table */}
        <div className="col-span-2" style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontWeight: 700, color: INK, fontSize: 14 }}>Prix par propriété</h2>
            <span style={{ fontSize: 11, color: INK_SOFT }}>Basé sur événements + saisonnalité + concurrence</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                {["Propriété", "Prix base", "Prix actuel", "Prix IA", "Occupation", "Tendance", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={monoLabel}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProp(p)}
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    background: selectedProp.id === p.id ? "rgba(224,32,96,0.03)" : "transparent",
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div style={{ fontWeight: 700, fontSize: 13, color: INK }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: INK_SOFT }}>{p.city}</div>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: INK_SOFT }}>{p.basePrice} €</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.currentPrice} €</td>
                  <td className="px-5 py-3.5">
                    <span style={{ fontSize: 13, fontWeight: 800, color: ROSE }}>{p.aiPrice} €</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 60, height: 6, background: "rgba(26,14,18,0.08)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: ROSE, borderRadius: 99, width: `${p.occupancy}%` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{p.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700,
                      color: p.trend === "up" ? "#1B7A4A" : "#C00040",
                    }}>
                      {p.trend === "up" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      {p.change > 0 ? "+" : ""}{p.change}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button style={{ fontSize: 11, fontWeight: 700, color: ROSE, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Appliquer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Events */}
          <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 className="flex items-center gap-2 mb-4" style={{ fontWeight: 700, fontSize: 13, color: INK }}>
              <Calendar size={14} style={{ color: ROSE }} />
              Événements à venir
            </h3>
            <div className="space-y-2.5">
              {events.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: INK_SOFT }}>{e.date}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99,
                    background: "rgba(27,122,74,0.1)", color: "#1B7A4A",
                  }}>{e.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly demand */}
          <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 18, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 13, color: INK, marginBottom: 16 }}>Demande par jour</h3>
            <div className="flex items-end gap-1.5 h-20">
              {weekData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    style={{
                      width: "100%", borderTopLeftRadius: 4, borderTopRightRadius: 4,
                      background: "rgba(224,32,96,0.2)", height: `${d.rate * 0.7}px`,
                    }}
                  />
                  <span style={{ fontSize: 10, color: INK_SOFT }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected property detail */}
          <div style={{ background: "rgba(224,32,96,0.04)", border: "1px solid rgba(224,32,96,0.15)", borderRadius: 18, padding: 20 }}>
            <h3 className="flex items-center gap-2 mb-3" style={{ fontWeight: 700, fontSize: 13, color: ROSE }}>
              <Zap size={13} />
              {selectedProp.name} — Recommandation IA
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span style={{ color: INK_SOFT }}>Prix actuel</span>
                <span style={{ fontWeight: 700, color: INK }}>{selectedProp.currentPrice} €/nuit</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span style={{ color: INK_SOFT }}>Prix IA optimal</span>
                <span style={{ fontWeight: 800, color: ROSE }}>{selectedProp.aiPrice} €/nuit</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span style={{ color: INK_SOFT }}>Gain estimé/mois</span>
                <span style={{ fontWeight: 700, color: "#1B7A4A" }}>+{Math.round((selectedProp.aiPrice - selectedProp.currentPrice) * 15)} €</span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(224,32,96,0.15)" }}>
                <p style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.5 }}>
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

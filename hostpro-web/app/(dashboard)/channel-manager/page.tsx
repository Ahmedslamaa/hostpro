"use client";
import { useState, useMemo, useRef } from "react";
import {
  RefreshCw, ChevronLeft, ChevronRight, Upload, Download,
  CheckCircle, AlertTriangle, Wifi, X, Plus, Minus,
  ArrowRight, BarChart2, Calendar, Settings2, FileText,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────

type Source = "airbnb" | "booking" | "abritel" | "direct" | "blocked" | "free";

interface CellData {
  source: Source;
  guestName?: string;
  reservationId?: string;
  isStart?: boolean;
  isEnd?: boolean;
  isMid?: boolean;
}

interface Property {
  id: string;
  name: string;
  city: string;
  baseRate: number;
  rates: Record<string, number>; // platform → rate
}

interface PlatformStatus {
  id: string;
  name: string;
  logo: string;
  color: string;
  bg: string;
  connected: boolean;
  lastSync: string;
  reservations: number;
}

// ── Mock data ──────────────────────────────────────────────────

const PROPERTIES: Property[] = [
  { id: "p1", name: "Villa Azur",      city: "Nice",    baseRate: 220, rates: { airbnb: 235, booking: 215, abritel: 218 } },
  { id: "p2", name: "Penthouse Côte",  city: "Monaco",  baseRate: 520, rates: { airbnb: 550, booking: 505, abritel: 510 } },
  { id: "p3", name: "Apt. Bellevue",   city: "Cannes",  baseRate: 138, rates: { airbnb: 145, booking: 132, abritel: 135 } },
  { id: "p4", name: "Studio Antibes",  city: "Antibes", baseRate: 75,  rates: { airbnb: 80,  booking: 72,  abritel: 74  } },
];

const PLATFORMS: PlatformStatus[] = [
  { id: "airbnb",  name: "Airbnb",       logo: "A", color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", connected: true,  lastSync: "Il y a 3 min",  reservations: 24 },
  { id: "booking", name: "Booking.com",  logo: "B", color: "text-blue-600",  bg: "bg-blue-50",      connected: true,  lastSync: "Il y a 11 min", reservations: 18 },
  { id: "abritel", name: "Abritel/VRBO", logo: "V", color: "text-cyan-600",  bg: "bg-cyan-50",      connected: false, lastSync: "Jamais",        reservations: 0  },
  { id: "direct",  name: "Direct",       logo: "D", color: "text-green-600", bg: "bg-green-50",     connected: true,  lastSync: "Il y a 1h",     reservations: 6  },
];

const SOURCE_STYLE: Record<Source, { bg: string; text: string; border: string; label: string }> = {
  airbnb:  { bg: "bg-[#FF5A5F]",    text: "text-white",      border: "border-[#FF5A5F]",    label: "Airbnb" },
  booking: { bg: "bg-blue-500",     text: "text-white",      border: "border-blue-500",     label: "Booking" },
  abritel: { bg: "bg-cyan-500",     text: "text-white",      border: "border-cyan-500",     label: "Abritel" },
  direct:  { bg: "bg-green-500",    text: "text-white",      border: "border-green-500",    label: "Direct" },
  blocked: { bg: "bg-[#BBBBBB]",    text: "text-white",      border: "border-[#BBBBBB]",    label: "Bloqué" },
  free:    { bg: "bg-white",        text: "text-[#717171]",  border: "border-[#DDDDDD]",    label: "Libre" },
};

// Generate mock calendar grid: 30 days from today
function buildGrid(): Record<string, Record<string, CellData>> {
  const grid: Record<string, Record<string, CellData>> = {};

  const reservations: Array<{ propId: string; start: number; len: number; source: Source; guest: string }> = [
    { propId: "p1", start: 1,  len: 4, source: "airbnb",  guest: "Sophie M." },
    { propId: "p1", start: 8,  len: 7, source: "booking", guest: "Jean P." },
    { propId: "p1", start: 18, len: 5, source: "airbnb",  guest: "Anna K." },
    { propId: "p2", start: 0,  len: 3, source: "airbnb",  guest: "Marc T." },
    { propId: "p2", start: 5,  len: 2, source: "direct",  guest: "Claire B." },
    { propId: "p2", start: 12, len: 9, source: "booking", guest: "Pierre L." },
    { propId: "p3", start: 2,  len: 5, source: "booking", guest: "Marie D." },
    { propId: "p3", start: 10, len: 3, source: "abritel", guest: "Lucas R." },
    { propId: "p3", start: 20, len: 6, source: "airbnb",  guest: "Emma S." },
    { propId: "p4", start: 3,  len: 2, source: "airbnb",  guest: "Tom H." },
    { propId: "p4", start: 7,  len: 4, source: "booking", guest: "Julie F." },
    { propId: "p4", start: 15, len: 3, source: "direct",  guest: "Paul G." },
    { propId: "p1", start: 26, len: 2, source: "blocked", guest: "" },
  ];

  PROPERTIES.forEach(p => { grid[p.id] = {}; });

  const today = new Date();
  for (let d = 0; d < 35; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    const key = dt.toISOString().slice(0, 10);
    PROPERTIES.forEach(p => {
      grid[p.id][key] = { source: "free" };
    });
  }

  reservations.forEach(r => {
    for (let i = 0; i < r.len; i++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() + r.start + i);
      const key = dt.toISOString().slice(0, 10);
      if (grid[r.propId]) {
        grid[r.propId][key] = {
          source: r.source,
          guestName: r.guest,
          isStart: i === 0,
          isEnd: i === r.len - 1,
          isMid: i > 0 && i < r.len - 1,
        };
      }
    }
  });

  return grid;
}

const GRID = buildGrid();

// ── Availability Matrix ────────────────────────────────────────

function AvailabilityMatrix() {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<{ propId: string; date: string } | null>(null);
  const DAYS_VISIBLE = 21;

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_VISIBLE }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset + i);
      return d;
    });
  }, [offset]);

  const dayLabels = ["D", "L", "M", "M", "J", "V", "S"];

  const isToday = (d: Date) => {
    const t = new Date();
    return d.toDateString() === t.toDateString();
  };

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDDDDD]">
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(o => Math.max(0, o - 7))} disabled={offset === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] hover:bg-[#F7F7F7] disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setOffset(0)}
            className="px-3 py-1.5 text-xs font-semibold border border-[#DDDDDD] rounded-lg hover:bg-[#F7F7F7] transition-colors">
            Aujourd'hui
          </button>
          <button onClick={() => setOffset(o => o + 7)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors">
            <ChevronRight size={14} />
          </button>
          <span className="text-sm font-semibold text-[#222222] ml-2">
            {days[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            {" → "}
            {days[days.length - 1].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2">
            {(["airbnb","booking","abritel","direct","blocked","free"] as Source[]).map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${SOURCE_STYLE[s].bg}`} />
                <span className="text-[10px] text-[#717171]">{SOURCE_STYLE[s].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: "900px" }}>
          <thead>
            <tr>
              {/* Property column header */}
              <th className="sticky left-0 bg-white z-10 w-36 px-4 py-2 text-left border-b border-r border-[#DDDDDD]">
                <span className="text-xs font-bold text-[#717171] uppercase tracking-wide">Propriété</span>
              </th>
              {days.map(d => (
                <th key={d.toISOString()} className={`border-b border-[#DDDDDD] px-0.5 py-1.5 text-center w-10
                  ${isWeekend(d) ? "bg-[#FAFAFA]" : "bg-white"}
                  ${isToday(d) ? "bg-[#FF5A5F]/5" : ""}`}>
                  <div className={`text-[9px] font-semibold mb-0.5 ${isToday(d) ? "text-[#FF5A5F]" : "text-[#BBBBBB]"}`}>
                    {dayLabels[d.getDay()]}
                  </div>
                  <div className={`text-xs font-black ${isToday(d) ? "text-[#FF5A5F]" : "text-[#222222]"}`}>
                    {d.getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROPERTIES.map((prop, pi) => (
              <tr key={prop.id} className={pi % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]/50"}>
                {/* Property name */}
                <td className="sticky left-0 bg-inherit z-10 border-r border-b border-[#DDDDDD] px-4 py-2">
                  <div className="font-semibold text-sm text-[#222222] truncate">{prop.name}</div>
                  <div className="text-xs text-[#717171]">{prop.city}</div>
                </td>
                {/* Day cells */}
                {days.map(d => {
                  const key = d.toISOString().slice(0, 10);
                  const cell = GRID[prop.id]?.[key] ?? { source: "free" };
                  const st = SOURCE_STYLE[cell.source];
                  const isSelected = selected?.propId === prop.id && selected?.date === key;

                  return (
                    <td key={key}
                      className={`border-b border-r border-[#F7F7F7] p-0.5 cursor-pointer
                        ${isWeekend(d) ? "bg-[#FAFAFA]/70" : ""}`}
                      onClick={() => setSelected(isSelected ? null : { propId: prop.id, date: key })}
                    >
                      <div className={`h-9 rounded flex items-center justify-center text-[9px] font-bold transition-all
                        ${st.bg} ${st.text}
                        ${isSelected ? "ring-2 ring-[#222222] ring-offset-1" : ""}
                        ${cell.source === "free" ? "border border-[#DDDDDD]/50 hover:bg-[#F7F7F7]" : "hover:opacity-80"}
                        ${cell.isStart ? "rounded-l-lg rounded-r-none" : ""}
                        ${cell.isEnd   ? "rounded-r-lg rounded-l-none" : ""}
                        ${cell.isMid   ? "rounded-none" : ""}
                      `}>
                        {cell.isStart && cell.guestName
                          ? <span className="px-1 truncate max-w-[36px]">{cell.guestName.split(" ")[0]}</span>
                          : cell.source === "free"
                            ? <span className="text-[#DDDDDD]">·</span>
                            : null
                        }
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick action tooltip */}
      {selected && (
        <div className="px-5 py-3 border-t border-[#DDDDDD] bg-[#F7F7F7] flex items-center gap-3">
          <span className="text-sm text-[#222222] font-medium">
            {PROPERTIES.find(p => p.id === selected.propId)?.name} ·{" "}
            {new Date(selected.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 bg-[#222222] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#444] transition-colors">
              <Minus size={11} /> Bloquer la date
            </button>
            <button className="flex items-center gap-1.5 bg-[#FF5A5F] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E00B41] transition-colors">
              <Plus size={11} /> Ajouter réservation
            </button>
            <button onClick={() => setSelected(null)} className="text-[#717171] hover:text-[#222222]">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rate Manager ───────────────────────────────────────────────

function RateManager() {
  const [rates, setRates] = useState<Property[]>(PROPERTIES);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const updateRate = (propId: string, platform: string, value: number) => {
    setRates(r => r.map(p => p.id === propId
      ? { ...p, rates: { ...p.rates, [platform]: value } }
      : p
    ));
  };

  const updateBase = (propId: string, value: number) => {
    setRates(r => r.map(p => p.id === propId ? { ...p, baseRate: value } : p));
  };

  const applyToAll = (propId: string) => {
    const prop = rates.find(p => p.id === propId);
    if (!prop) return;
    setRates(r => r.map(p => p.id === propId
      ? { ...p, rates: { airbnb: prop.baseRate, booking: prop.baseRate, abritel: prop.baseRate } }
      : p
    ));
  };

  const handleSave = async (propId: string) => {
    setSaving(propId);
    await new Promise(r => setTimeout(r, 800));
    setSaving(null);
    setSaved(propId);
    setTimeout(() => setSaved(null), 2000);
  };

  const platforms = ["airbnb", "booking", "abritel"];
  const platformLabels: Record<string, { name: string; color: string }> = {
    airbnb:  { name: "Airbnb",      color: "text-[#FF5A5F]" },
    booking: { name: "Booking.com", color: "text-blue-600"  },
    abritel: { name: "Abritel",     color: "text-cyan-600"  },
  };

  return (
    <div className="space-y-4">
      {rates.map(prop => (
        <div key={prop.id} className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDDDDD] bg-[#FAFAFA]">
            <div>
              <span className="font-bold text-sm text-[#222222]">{prop.name}</span>
              <span className="text-xs text-[#717171] ml-2">{prop.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => applyToAll(prop.id)}
                className="text-xs text-[#717171] hover:text-[#222222] border border-[#DDDDDD] px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
                Appliquer tarif base à tous
              </button>
              <button onClick={() => handleSave(prop.id)} disabled={!!saving}
                className="flex items-center gap-1.5 bg-[#FF5A5F] hover:bg-[#E00B41] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                {saving === prop.id
                  ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi...</>
                  : saved === prop.id
                    ? <><CheckCircle size={12} /> Enregistré</>
                    : <><ArrowRight size={12} /> Pousser vers les plateformes</>
                }
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-4">
              {/* Base rate */}
              <div>
                <label className="text-xs font-bold text-[#222222] mb-1.5 block">Tarif de base / nuit</label>
                <div className="relative">
                  <input
                    type="number"
                    value={prop.baseRate}
                    onChange={e => updateBase(prop.id, Number(e.target.value))}
                    className="w-full border-2 border-[#222222] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#FF5A5F] pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] text-sm">€</span>
                </div>
              </div>
              {/* Platform rates */}
              {platforms.map(pl => (
                <div key={pl}>
                  <label className={`text-xs font-bold mb-1.5 block ${platformLabels[pl].color}`}>
                    {platformLabels[pl].name}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={prop.rates[pl] ?? prop.baseRate}
                      onChange={e => updateRate(prop.id, pl, Number(e.target.value))}
                      className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF5A5F] pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] text-sm">€</span>
                  </div>
                  {prop.rates[pl] !== prop.baseRate && (
                    <div className={`text-[10px] mt-1 font-semibold ${prop.rates[pl] > prop.baseRate ? "text-green-600" : "text-red-500"}`}>
                      {prop.rates[pl] > prop.baseRate ? "+" : ""}{prop.rates[pl] - prop.baseRate}€ vs base
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CSV Import ─────────────────────────────────────────────────

const CSV_COLUMNS: Record<string, string[]> = {
  airbnb: ["Confirmation Code", "Start Date", "End Date", "Guest Name", "Phone", "Email", "Nights", "Adults", "Amount", "Currency", "Status"],
  booking: ["Reservation number", "Arrival", "Departure", "Guest name", "Phone", "Email", "Rooms", "Adults", "Total price", "Currency", "Status"],
  abritel: ["ID réservation", "Date d'arrivée", "Date de départ", "Nom du voyageur", "Téléphone", "Email", "Nuits", "Adultes", "Montant", "Devise", "Statut"],
};

function CsvImport() {
  const [platform, setPlatform] = useState("airbnb");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    await new Promise(r => setTimeout(r, 1800));
    setImporting(false);
    setResult({ imported: Math.floor(Math.random() * 15) + 5, skipped: Math.floor(Math.random() * 3) });
  };

  const platformMeta: Record<string, { name: string; logo: string; logoColor: string; logoBg: string; instructions: string[] }> = {
    airbnb: {
      name: "Airbnb", logo: "A", logoColor: "text-[#FF5A5F]", logoBg: "bg-[#FF5A5F]/10",
      instructions: [
        "Connectez-vous à Airbnb.fr → Menu → Réservations",
        'Cliquez sur "Exporter en CSV" en haut à droite',
        "Téléchargez le fichier et importez-le ici",
      ],
    },
    booking: {
      name: "Booking.com", logo: "B", logoColor: "text-blue-600", logoBg: "bg-blue-50",
      instructions: [
        "Connectez-vous à l'Extranet Booking.com",
        'Allez dans Réservations → "Exporter"',
        "Choisissez la plage de dates et téléchargez le CSV",
      ],
    },
    abritel: {
      name: "Abritel / VRBO", logo: "V", logoColor: "text-cyan-600", logoBg: "bg-cyan-50",
      instructions: [
        "Connectez-vous à votre espace propriétaire Abritel",
        'Allez dans Réservations → "Télécharger"',
        "Importez le fichier CSV ici",
      ],
    },
  };

  const meta = platformMeta[platform];
  const columns = CSV_COLUMNS[platform];

  return (
    <div className="space-y-6">
      {/* Platform selector */}
      <div className="flex gap-3">
        {Object.entries(platformMeta).map(([id, m]) => (
          <button
            key={id}
            onClick={() => { setPlatform(id); setFile(null); setResult(null); }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all
              ${platform === id ? "border-[#FF5A5F] bg-[#FF5A5F]/5" : "border-[#DDDDDD] bg-white hover:border-[#222222]"}`}
          >
            <div className={`w-8 h-8 ${m.logoBg} rounded-xl flex items-center justify-center font-black text-sm ${m.logoColor}`}>
              {m.logo}
            </div>
            <span className={`font-semibold text-sm ${platform === id ? "text-[#FF5A5F]" : "text-[#222222]"}`}>{m.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="font-bold text-blue-800 text-sm mb-3">Comment exporter depuis {meta.name} ?</p>
          <ol className="space-y-2">
            {meta.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-700">
                <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Drop zone */}
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all
              ${dragging ? "border-[#FF5A5F] bg-[#FF5A5F]/5" : file ? "border-green-400 bg-green-50" : "border-[#DDDDDD] hover:border-[#FF5A5F]/40 hover:bg-[#F7F7F7]"}`}
          >
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <>
                <CheckCircle size={32} className="text-green-500" />
                <div className="text-center">
                  <p className="font-semibold text-sm text-[#222222]">{file.name}</p>
                  <p className="text-xs text-[#717171]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-400 hover:text-red-600">
                  Supprimer
                </button>
              </>
            ) : (
              <>
                <Upload size={32} className="text-[#DDDDDD]" />
                <div className="text-center">
                  <p className="font-semibold text-sm text-[#717171]">Glissez votre fichier CSV ici</p>
                  <p className="text-xs text-[#BBBBBB] mt-1">ou cliquez pour parcourir</p>
                </div>
              </>
            )}
          </div>

          {file && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full mt-3 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {importing
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Import en cours...</>
                : <><FileText size={15} /> Importer les réservations</>
              }
            </button>
          )}

          {result && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-sm">{result.imported} réservations importées</p>
                <p className="text-xs text-green-700">{result.skipped} ignorées (doublons)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column mapping preview */}
      <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DDDDDD] bg-[#FAFAFA]">
          <p className="text-sm font-bold text-[#222222]">Colonnes importées depuis {meta.name}</p>
          <p className="text-xs text-[#717171] mt-0.5">Ces colonnes sont automatiquement mappées vers les champs HOSTPRO.</p>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {columns.map((col, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg px-3 py-1.5 text-xs">
                <span className="font-medium text-[#717171]">{col}</span>
                <ArrowRight size={10} className="text-[#BBBBBB]" />
                <span className="font-semibold text-[#222222]">
                  {["Code", "Arrivée", "Départ", "Voyageur", "Téléphone", "Email", "Nuits", "Adultes", "Montant", "Devise", "Statut"][i]}
                </span>
                <CheckCircle size={10} className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Platform status bar ────────────────────────────────────────

function PlatformBar({ onSyncAll, syncing }: { onSyncAll: () => void; syncing: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {PLATFORMS.map(p => (
        <div key={p.id} className="bg-white border border-[#DDDDDD] rounded-2xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${p.color}`}>
            {p.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[#222222]">{p.name}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${p.connected ? "bg-green-500" : "bg-[#DDDDDD]"}`} />
            </div>
            <div className="text-xs text-[#717171]">
              {p.connected ? `${p.reservations} rés. · ${p.lastSync}` : "Non connecté"}
            </div>
          </div>
          {p.connected && (
            <button
              onClick={onSyncAll}
              className="text-[#717171] hover:text-[#FF5A5F] transition-colors"
              title="Synchroniser"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

const TABS = [
  { id: "matrix",   label: "Matrice dispo",  icon: Calendar  },
  { id: "rates",    label: "Tarifs",         icon: BarChart2 },
  { id: "import",   label: "Import CSV",     icon: Upload    },
  { id: "connect",  label: "Connexions",     icon: Settings2 },
] as const;

// ── Connect tab ────────────────────────────────────────────────

function ConnectTab() {
  const [platforms, setPlatforms] = useState([
    { id: "airbnb",  name: "Airbnb",       logo: "A", color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", connected: true,  syncAuto: true,  lastSync: "Il y a 3 min",  reservations: 24, commission: "3%" },
    { id: "booking", name: "Booking.com",  logo: "B", color: "text-blue-600",  bg: "bg-blue-50",      connected: true,  syncAuto: true,  lastSync: "Il y a 11 min", reservations: 18, commission: "15%" },
    { id: "abritel", name: "Abritel/VRBO", logo: "V", color: "text-cyan-600",  bg: "bg-cyan-50",      connected: false, syncAuto: false, lastSync: "Jamais",        reservations: 0,  commission: "8%" },
    { id: "direct",  name: "Direct / Site", logo: "D", color: "text-green-600",bg: "bg-green-50",      connected: true,  syncAuto: false, lastSync: "Il y a 1h",     reservations: 6,  commission: "0%" },
    { id: "expedia", name: "Expedia",      logo: "E", color: "text-amber-600", bg: "bg-amber-50",     connected: false, syncAuto: false, lastSync: "Jamais",        reservations: 0,  commission: "20%" },
    { id: "tripadv", name: "TripAdvisor",  logo: "T", color: "text-green-700", bg: "bg-green-100",    connected: false, syncAuto: false, lastSync: "Jamais",        reservations: 0,  commission: "3%" },
  ]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggle = async (id: string) => {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1200));
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
    setConnecting(null);
  };

  const toggleSync = (id: string) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, syncAuto: !p.syncAuto } : p));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-2xl p-4">
          <div className="text-2xl font-black text-green-600">{connectedCount}</div>
          <div className="text-xs text-[#717171]">Plateformes connectées</div>
        </div>
        <div className="bg-[#FF5A5F]/10 rounded-2xl p-4">
          <div className="text-2xl font-black text-[#FF5A5F]">{platforms.filter(p => p.connected).reduce((s, p) => s + p.reservations, 0)}</div>
          <div className="text-xs text-[#717171]">Réservations actives</div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="text-2xl font-black text-blue-600">{platforms.filter(p => p.syncAuto).length}</div>
          <div className="text-xs text-[#717171]">Syncs auto actives</div>
        </div>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-2 gap-4">
        {platforms.map(p => (
          <div key={p.id} className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 ${p.bg} rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${p.color}`}>{p.logo}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#222222]">{p.name}</span>
                  <div className={`flex items-center gap-1 text-xs font-bold ${p.connected ? "text-green-600" : "text-[#BBBBBB]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${p.connected ? "bg-green-500" : "bg-[#DDDDDD]"}`} />
                    {p.connected ? "Connecté" : "Déconnecté"}
                  </div>
                </div>
                <div className="text-xs text-[#717171] mt-0.5">Commission : {p.commission}</div>
              </div>
            </div>

            {p.connected && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#F7F7F7] rounded-xl p-2 text-center">
                  <div className="text-lg font-black text-[#222222]">{p.reservations}</div>
                  <div className="text-[10px] text-[#717171]">réservations</div>
                </div>
                <div className="bg-[#F7F7F7] rounded-xl p-2 text-center">
                  <div className="text-xs font-bold text-[#222222]">{p.lastSync}</div>
                  <div className="text-[10px] text-[#717171]">dernière sync</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(p.id)}
                disabled={connecting === p.id}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  p.connected
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-[#FF5A5F] text-white hover:bg-[#E00B41]"
                }`}
              >
                {connecting === p.id
                  ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> {p.connected ? "Déconnexion..." : "Connexion..."}</>
                  : p.connected ? "Déconnecter" : "Connecter"
                }
              </button>
              {p.connected && (
                <button
                  onClick={() => toggleSync(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    p.syncAuto ? "bg-green-50 border-green-200 text-green-700" : "border-[#DDDDDD] text-[#717171] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <RefreshCw size={11} className={p.syncAuto ? "animate-spin" : ""} />
                  Auto
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* iCal info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-blue-800 text-sm">Synchronisation iCal bidirectionnelle</p>
            <p className="text-xs text-blue-700 mt-1">
              Importez et exportez vos disponibilités via iCal pour toutes les plateformes non listées.
              Accédez à la gestion iCal depuis <strong>Propriétés → Modifier → Synchronisation iCal</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelManagerPage() {
  const [tab, setTab] = useState<"matrix" | "rates" | "import" | "connect">("matrix");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Il y a 3 min");

  const handleSyncAll = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(false);
    setLastSync("À l'instant");
  };

  const connected = PLATFORMS.filter(p => p.connected).length;
  const totalRes   = PLATFORMS.reduce((s, p) => s + p.reservations, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">Channel Manager</h1>
          <p className="text-sm text-[#717171] mt-0.5">
            Matrice dispo · Tarifs multi-plateformes · Import CSV · Sync automatique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#717171] bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 py-2">
            <Clock size={13} /> Dernière sync : {lastSync}
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Synchronisation..." : "Tout synchroniser"}
          </button>
        </div>
      </div>

      {/* Platform status */}
      <PlatformBar onSyncAll={handleSyncAll} syncing={syncing} />

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Plateformes connectées", value: `${connected}/4`,  color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Réservations actives",   value: totalRes,          color: "text-[#FF5A5F]",  bg: "bg-[#FF5A5F]/10" },
          { label: "Propriétés gérées",      value: PROPERTIES.length, color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Sync / 15 min",          value: "Auto ✓",          color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#717171] mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F7F7F7] p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t.id ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "matrix"  && <AvailabilityMatrix />}
      {tab === "rates"   && <RateManager />}
      {tab === "import"  && <CsvImport />}
      {tab === "connect" && <ConnectTab />}
    </div>
  );
}

// Missing import
function Clock({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

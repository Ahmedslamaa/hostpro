"use client";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, Euro, Home, Users, Star,
  Calendar, BarChart2, Target, Zap, Download, RefreshCw,
  ArrowUpRight, ArrowDownRight, Info, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Data ───────────────────────────────────────────────────────────────

const PERIODS = ["7 jours", "30 jours", "3 mois", "6 mois", "12 mois"] as const;
type Period = typeof PERIODS[number];

interface KPI {
  label: string;
  value: string;
  prev: string;
  delta: number;  // percentage
  icon: React.ReactNode;
  color: string;
  bg: string;
  info: string;
}

const DATA: Record<Period, {
  kpis: KPI[];
  revenue: number[];
  occupancy: number[];
  channels: { name: string; pct: number; rev: number; color: string }[];
  properties: { name: string; city: string; revenue: number; occ: number; adr: number; revpar: number; rating: number; nights: number }[];
  heatmap: number[][];
  forecast: { month: string; actual: number | null; forecast: number }[];
}> = {
  "7 jours": {
    kpis: [
      { label: "Revenus", value: "4 280€", prev: "3 810€", delta: 12.3, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", info: "Revenus bruts des 7 derniers jours" },
      { label: "Taux d'occupation", value: "74%", prev: "68%", delta: 8.8, icon: <Target size={18} />, color: "text-green-600", bg: "bg-green-50", info: "Nuits occupées / nuits disponibles" },
      { label: "ADR", value: "182€", prev: "175€", delta: 4.0, icon: <BarChart2 size={18} />, color: "text-blue-600", bg: "bg-blue-50", info: "Average Daily Rate — tarif moyen par nuit" },
      { label: "RevPAR", value: "135€", prev: "119€", delta: 13.4, icon: <TrendingUp size={18} />, color: "text-purple-600", bg: "bg-purple-50", info: "Revenue Per Available Room (ADR × Occupation)" },
      { label: "Réservations", value: "12", prev: "9", delta: 33.3, icon: <Calendar size={18} />, color: "text-amber-600", bg: "bg-amber-50", info: "Nouvelles réservations confirmées" },
      { label: "Note moyenne", value: "4.87", prev: "4.82", delta: 1.0, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50", info: "Note moyenne sur toutes les plateformes" },
      { label: "ROI net", value: "68%", prev: "61%", delta: 11.5, icon: <Zap size={18} />, color: "text-[#222222]", bg: "bg-[#F7F7F7]", info: "Return on Investment — revenus nets / coûts" },
      { label: "Durée moy. séjour", value: "3.2 nuits", prev: "2.9 nuits", delta: 10.3, icon: <Users size={18} />, color: "text-cyan-600", bg: "bg-cyan-50", info: "Durée moyenne des séjours" },
    ],
    revenue: [580, 620, 490, 750, 610, 720, 510],
    occupancy: [70, 75, 65, 85, 72, 80, 68],
    channels: [
      { name: "Airbnb",      pct: 48, rev: 2054, color: "bg-[#FF5A5F]" },
      { name: "Booking.com", pct: 31, rev: 1327, color: "bg-blue-500" },
      { name: "Direct",      pct: 13, rev: 556,  color: "bg-green-500" },
      { name: "Abritel",     pct: 8,  rev: 342,  color: "bg-cyan-500" },
    ],
    properties: [
      { name: "Villa Azur",     city: "Nice",    revenue: 1840, occ: 82, adr: 224, revpar: 184, rating: 4.92, nights: 6 },
      { name: "Penthouse Côte", city: "Monaco",  revenue: 1560, occ: 71, adr: 221, revpar: 157, rating: 4.85, nights: 5 },
      { name: "Apt. Bellevue",  city: "Cannes",  revenue: 580,  occ: 68, adr: 121, revpar: 82,  rating: 4.88, nights: 3 },
      { name: "Studio Antibes", city: "Antibes", revenue: 300,  occ: 57, adr: 75,  revpar: 43,  rating: 4.79, nights: 2 },
    ],
    heatmap: Array.from({ length: 5 }, (_, w) => Array.from({ length: 7 }, (_, d) => Math.floor(Math.random() * 100))),
    forecast: [
      { month: "J", actual: 4280, forecast: 4280 },
      { month: "F", actual: null, forecast: 4650 },
      { month: "M", actual: null, forecast: 5200 },
    ],
  },
  "30 jours": {
    kpis: [
      { label: "Revenus", value: "18 640€", prev: "15 890€", delta: 17.3, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", info: "Revenus bruts des 30 derniers jours" },
      { label: "Taux d'occupation", value: "78%", prev: "71%", delta: 9.9, icon: <Target size={18} />, color: "text-green-600", bg: "bg-green-50", info: "Nuits occupées / nuits disponibles" },
      { label: "ADR", value: "196€", prev: "182€", delta: 7.7, icon: <BarChart2 size={18} />, color: "text-blue-600", bg: "bg-blue-50", info: "Average Daily Rate" },
      { label: "RevPAR", value: "153€", prev: "129€", delta: 18.6, icon: <TrendingUp size={18} />, color: "text-purple-600", bg: "bg-purple-50", info: "Revenue Per Available Room" },
      { label: "Réservations", value: "47", prev: "38", delta: 23.7, icon: <Calendar size={18} />, color: "text-amber-600", bg: "bg-amber-50", info: "Nouvelles réservations" },
      { label: "Note moyenne", value: "4.89", prev: "4.83", delta: 1.2, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50", info: "Note moyenne toutes plateformes" },
      { label: "ROI net", value: "72%", prev: "65%", delta: 10.8, icon: <Zap size={18} />, color: "text-[#222222]", bg: "bg-[#F7F7F7]", info: "Return on Investment net" },
      { label: "Durée moy. séjour", value: "3.8 nuits", prev: "3.2 nuits", delta: 18.8, icon: <Users size={18} />, color: "text-cyan-600", bg: "bg-cyan-50", info: "Durée moyenne des séjours" },
    ],
    revenue: [420, 580, 650, 490, 720, 610, 800, 540, 690, 750, 480, 620, 700, 580, 810, 490, 660, 730, 570, 640, 790, 510, 680, 750, 580, 700, 840, 560, 690, 720],
    occupancy: [68, 75, 82, 71, 85, 78, 90, 73, 80, 88, 65, 77, 83, 76, 91, 67, 79, 86, 72, 81, 89, 70, 82, 87, 74, 83, 92, 71, 80, 85],
    channels: [
      { name: "Airbnb",      pct: 45, rev: 8388, color: "bg-[#FF5A5F]" },
      { name: "Booking.com", pct: 34, rev: 6338, color: "bg-blue-500" },
      { name: "Direct",      pct: 14, rev: 2610, color: "bg-green-500" },
      { name: "Abritel",     pct: 7,  rev: 1305, color: "bg-cyan-500" },
    ],
    properties: [
      { name: "Villa Azur",     city: "Nice",    revenue: 7840, occ: 86, adr: 227, revpar: 195, rating: 4.93, nights: 26 },
      { name: "Penthouse Côte", city: "Monaco",  revenue: 6420, occ: 74, adr: 523, revpar: 387, rating: 4.87, nights: 22 },
      { name: "Apt. Bellevue",  city: "Cannes",  revenue: 2860, occ: 72, adr: 138, revpar: 99,  rating: 4.89, nights: 16 },
      { name: "Studio Antibes", city: "Antibes", revenue: 1520, occ: 61, adr: 78,  revpar: 48,  rating: 4.81, nights: 12 },
    ],
    heatmap: Array.from({ length: 5 }, (_, w) => Array.from({ length: 7 }, (_, d) => 40 + Math.floor(Math.random() * 60))),
    forecast: [
      { month: "Avr", actual: 17200, forecast: 17200 },
      { month: "Mai", actual: 18640, forecast: 18640 },
      { month: "Juin", actual: null, forecast: 21500 },
      { month: "Juil", actual: null, forecast: 26800 },
      { month: "Août", actual: null, forecast: 29400 },
    ],
  },
  "3 mois": {
    kpis: [
      { label: "Revenus", value: "54 200€", prev: "46 800€", delta: 15.8, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", info: "Revenus bruts 3 mois" },
      { label: "Taux d'occupation", value: "81%", prev: "74%", delta: 9.5, icon: <Target size={18} />, color: "text-green-600", bg: "bg-green-50", info: "Nuits occupées / nuits disponibles" },
      { label: "ADR", value: "203€", prev: "188€", delta: 8.0, icon: <BarChart2 size={18} />, color: "text-blue-600", bg: "bg-blue-50", info: "Average Daily Rate" },
      { label: "RevPAR", value: "164€", prev: "139€", delta: 18.0, icon: <TrendingUp size={18} />, color: "text-purple-600", bg: "bg-purple-50", info: "Revenue Per Available Room" },
      { label: "Réservations", value: "138", prev: "112", delta: 23.2, icon: <Calendar size={18} />, color: "text-amber-600", bg: "bg-amber-50", info: "Nouvelles réservations" },
      { label: "Note moyenne", value: "4.91", prev: "4.85", delta: 1.2, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50", info: "Note moyenne toutes plateformes" },
      { label: "ROI net", value: "74%", prev: "67%", delta: 10.4, icon: <Zap size={18} />, color: "text-[#222222]", bg: "bg-[#F7F7F7]", info: "Return on Investment net" },
      { label: "Durée moy. séjour", value: "3.9 nuits", prev: "3.4 nuits", delta: 14.7, icon: <Users size={18} />, color: "text-cyan-600", bg: "bg-cyan-50", info: "Durée moyenne des séjours" },
    ],
    revenue: [15800, 18200, 20200],
    occupancy: [74, 79, 84],
    channels: [
      { name: "Airbnb",      pct: 44, rev: 23848, color: "bg-[#FF5A5F]" },
      { name: "Booking.com", pct: 35, rev: 18970, color: "bg-blue-500" },
      { name: "Direct",      pct: 14, rev: 7588,  color: "bg-green-500" },
      { name: "Abritel",     pct: 7,  rev: 3794,  color: "bg-cyan-500" },
    ],
    properties: [
      { name: "Villa Azur",     city: "Nice",    revenue: 23400, occ: 88, adr: 229, revpar: 202, rating: 4.94, nights: 78 },
      { name: "Penthouse Côte", city: "Monaco",  revenue: 18900, occ: 76, adr: 528, revpar: 401, rating: 4.88, nights: 64 },
      { name: "Apt. Bellevue",  city: "Cannes",  revenue: 7800,  occ: 73, adr: 140, revpar: 102, rating: 4.90, nights: 42 },
      { name: "Studio Antibes", city: "Antibes", revenue: 4100,  occ: 62, adr: 79,  revpar: 49,  rating: 4.82, nights: 31 },
    ],
    heatmap: Array.from({ length: 13 }, () => Array.from({ length: 7 }, () => 30 + Math.floor(Math.random() * 70))),
    forecast: [
      { month: "Fév", actual: 15800, forecast: 15800 },
      { month: "Mar", actual: 18200, forecast: 18200 },
      { month: "Avr", actual: 20200, forecast: 20200 },
      { month: "Mai", actual: null, forecast: 24000 },
      { month: "Juin", actual: null, forecast: 28500 },
    ],
  },
  "6 mois": {
    kpis: [
      { label: "Revenus", value: "98 400€", prev: "82 100€", delta: 19.9, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", info: "Revenus bruts 6 mois" },
      { label: "Taux d'occupation", value: "83%", prev: "75%", delta: 10.7, icon: <Target size={18} />, color: "text-green-600", bg: "bg-green-50", info: "Nuits occupées / nuits disponibles" },
      { label: "ADR", value: "211€", prev: "194€", delta: 8.8, icon: <BarChart2 size={18} />, color: "text-blue-600", bg: "bg-blue-50", info: "Average Daily Rate" },
      { label: "RevPAR", value: "175€", prev: "146€", delta: 19.9, icon: <TrendingUp size={18} />, color: "text-purple-600", bg: "bg-purple-50", info: "Revenue Per Available Room" },
      { label: "Réservations", value: "271", prev: "218", delta: 24.3, icon: <Calendar size={18} />, color: "text-amber-600", bg: "bg-amber-50", info: "Nouvelles réservations" },
      { label: "Note moyenne", value: "4.92", prev: "4.86", delta: 1.2, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50", info: "Note moyenne toutes plateformes" },
      { label: "ROI net", value: "76%", prev: "68%", delta: 11.8, icon: <Zap size={18} />, color: "text-[#222222]", bg: "bg-[#F7F7F7]", info: "Return on Investment net" },
      { label: "Durée moy. séjour", value: "4.1 nuits", prev: "3.6 nuits", delta: 13.9, icon: <Users size={18} />, color: "text-cyan-600", bg: "bg-cyan-50", info: "Durée moyenne des séjours" },
    ],
    revenue: [11200, 14800, 15800, 17400, 18200, 21000],
    occupancy: [70, 75, 78, 82, 86, 89],
    channels: [
      { name: "Airbnb",      pct: 43, rev: 42312, color: "bg-[#FF5A5F]" },
      { name: "Booking.com", pct: 36, rev: 35424, color: "bg-blue-500" },
      { name: "Direct",      pct: 14, rev: 13776, color: "bg-green-500" },
      { name: "Abritel",     pct: 7,  rev: 6888,  color: "bg-cyan-500" },
    ],
    properties: [
      { name: "Villa Azur",     city: "Nice",    revenue: 43200, occ: 91, adr: 231, revpar: 210, rating: 4.95, nights: 158 },
      { name: "Penthouse Côte", city: "Monaco",  revenue: 34100, occ: 78, adr: 531, revpar: 414, rating: 4.89, nights: 130 },
      { name: "Apt. Bellevue",  city: "Cannes",  revenue: 13800, occ: 75, adr: 142, revpar: 107, rating: 4.91, nights: 82 },
      { name: "Studio Antibes", city: "Antibes", revenue: 7300,  occ: 64, adr: 80,  revpar: 51,  rating: 4.83, nights: 58 },
    ],
    heatmap: Array.from({ length: 26 }, () => Array.from({ length: 7 }, () => 25 + Math.floor(Math.random() * 75))),
    forecast: [
      { month: "Nov", actual: 11200, forecast: 11200 },
      { month: "Déc", actual: 14800, forecast: 14800 },
      { month: "Jan", actual: 15800, forecast: 15800 },
      { month: "Fév", actual: 17400, forecast: 17400 },
      { month: "Mar", actual: 18200, forecast: 18200 },
      { month: "Avr", actual: 21000, forecast: 21000 },
      { month: "Mai", actual: null, forecast: 25200 },
      { month: "Juin", actual: null, forecast: 30400 },
    ],
  },
  "12 mois": {
    kpis: [
      { label: "Revenus", value: "187 200€", prev: "151 400€", delta: 23.6, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", info: "Revenus bruts annuels" },
      { label: "Taux d'occupation", value: "85%", prev: "77%", delta: 10.4, icon: <Target size={18} />, color: "text-green-600", bg: "bg-green-50", info: "Nuits occupées / nuits disponibles" },
      { label: "ADR", value: "218€", prev: "198€", delta: 10.1, icon: <BarChart2 size={18} />, color: "text-blue-600", bg: "bg-blue-50", info: "Average Daily Rate" },
      { label: "RevPAR", value: "185€", prev: "153€", delta: 20.9, icon: <TrendingUp size={18} />, color: "text-purple-600", bg: "bg-purple-50", info: "Revenue Per Available Room" },
      { label: "Réservations", value: "512", prev: "398", delta: 28.6, icon: <Calendar size={18} />, color: "text-amber-600", bg: "bg-amber-50", info: "Réservations sur 12 mois" },
      { label: "Note moyenne", value: "4.93", prev: "4.87", delta: 1.2, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50", info: "Note moyenne toutes plateformes" },
      { label: "ROI net", value: "79%", prev: "70%", delta: 12.9, icon: <Zap size={18} />, color: "text-[#222222]", bg: "bg-[#F7F7F7]", info: "Return on Investment annuel" },
      { label: "Durée moy. séjour", value: "4.2 nuits", prev: "3.7 nuits", delta: 13.5, icon: <Users size={18} />, color: "text-cyan-600", bg: "bg-cyan-50", info: "Durée moyenne des séjours" },
    ],
    revenue: [8200, 9400, 11800, 14200, 18400, 22800, 27400, 26100, 21600, 15800, 12400, 9000],
    occupancy: [62, 68, 74, 79, 87, 93, 97, 95, 88, 80, 72, 64],
    channels: [
      { name: "Airbnb",      pct: 42, rev: 78624, color: "bg-[#FF5A5F]" },
      { name: "Booking.com", pct: 37, rev: 69264, color: "bg-blue-500" },
      { name: "Direct",      pct: 14, rev: 26208, color: "bg-green-500" },
      { name: "Abritel",     pct: 7,  rev: 13104, color: "bg-cyan-500" },
    ],
    properties: [
      { name: "Villa Azur",     city: "Nice",    revenue: 82400, occ: 93, adr: 234, revpar: 218, rating: 4.96, nights: 310 },
      { name: "Penthouse Côte", city: "Monaco",  revenue: 63800, occ: 80, adr: 534, revpar: 427, rating: 4.90, nights: 258 },
      { name: "Apt. Bellevue",  city: "Cannes",  revenue: 26400, occ: 78, adr: 145, revpar: 113, rating: 4.92, nights: 162 },
      { name: "Studio Antibes", city: "Antibes", revenue: 14600, occ: 66, adr: 82,  revpar: 54,  rating: 4.84, nights: 110 },
    ],
    heatmap: Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => 10 + Math.floor(Math.random() * 90))),
    forecast: [
      { month: "Jan", actual: 9400, forecast: 9400 },
      { month: "Fév", actual: 11800, forecast: 11800 },
      { month: "Mar", actual: 14200, forecast: 14200 },
      { month: "Avr", actual: 18400, forecast: 18400 },
      { month: "Mai", actual: 22800, forecast: 22800 },
      { month: "Juin", actual: null, forecast: 28000 },
      { month: "Juil", actual: null, forecast: 32000 },
      { month: "Août", actual: null, forecast: 30500 },
    ],
  },
};

// ── Mini bar chart ─────────────────────────────────────────────────────────────

function MiniBar({ values, color = "#FF5A5F" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all hover:opacity-80" style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.7 + (i / values.length) * 0.3 }} />
      ))}
    </div>
  );
}

// ── Occupancy heatmap ─────────────────────────────────────────────────────────

function OccupancyHeatmap({ data }: { data: number[][] }) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const maxWeeks = Math.min(data.length, 8);
  const visible = data.slice(-maxWeeks);

  const getColor = (v: number) => {
    if (v === 0) return "bg-[#F7F7F7]";
    if (v < 30) return "bg-red-100";
    if (v < 50) return "bg-orange-200";
    if (v < 70) return "bg-amber-300";
    if (v < 85) return "bg-green-400";
    return "bg-green-600";
  };

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {days.map(d => <div key={d} className="flex-1 text-center text-[9px] text-[#BBBBBB] font-bold">{d}</div>)}
      </div>
      <div className="space-y-1">
        {visible.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((v, di) => (
              <div key={di} title={`${v}% occupation`}
                className={cn("flex-1 h-5 rounded-sm transition-all hover:scale-110 cursor-default", getColor(v))} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-[9px] text-[#BBBBBB]">Faible</span>
        {["bg-red-100", "bg-orange-200", "bg-amber-300", "bg-green-400", "bg-green-600"].map((c, i) => (
          <div key={i} className={cn("w-3 h-3 rounded-sm", c)} />
        ))}
        <span className="text-[9px] text-[#BBBBBB]">Élevé</span>
      </div>
    </div>
  );
}

// ── Forecast chart ────────────────────────────────────────────────────────────

function ForecastChart({ data }: { data: { month: string; actual: number | null; forecast: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.forecast));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex-1 flex items-end w-full gap-0.5">
            {d.actual !== null ? (
              <div className="flex-1 bg-[#FF5A5F] rounded-t-sm transition-all" style={{ height: `${(d.actual / maxVal) * 100}%` }} />
            ) : (
              <div className="flex-1 border-2 border-dashed border-[#FF5A5F]/40 bg-[#FF5A5F]/5 rounded-t-sm" style={{ height: `${(d.forecast / maxVal) * 100}%` }} />
            )}
          </div>
          <span className="text-[9px] text-[#BBBBBB] font-medium">{d.month}</span>
          <span className={cn("text-[9px] font-bold", d.actual !== null ? "text-[#FF5A5F]" : "text-[#BBBBBB]")}>
            {d.actual !== null
              ? `${(d.actual / 1000).toFixed(0)}k`
              : `~${(d.forecast / 1000).toFixed(0)}k`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30 jours");
  const [hoveredKPI, setHoveredKPI] = useState<number | null>(null);
  const d = DATA[period];

  const monthLabels: Record<Period, string[]> = {
    "7 jours":  ["L", "M", "M", "J", "V", "S", "D"],
    "30 jours": Array.from({ length: 30 }, (_, i) => `${i + 1}`).filter((_, i) => i % 5 === 0),
    "3 mois":   ["Fév", "Mar", "Avr"],
    "6 mois":   ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"],
    "12 mois":  ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Analytics & Performance</h1>
          <p className="text-[#717171] text-sm mt-0.5">KPIs financiers · ROI · Prévisions · Taux d'occupation</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex gap-1 bg-[#F7F7F7] p-1 rounded-xl">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  period === p ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"
                )}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 border border-[#DDDDDD] rounded-xl px-3 py-2 text-xs font-semibold text-[#717171] hover:bg-[#F7F7F7] transition-colors">
            <Download size={13} /> Exporter
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {d.kpis.map((kpi, i) => (
          <div key={i}
            className="bg-white rounded-2xl border border-[#DDDDDD] p-4 hover:shadow-md transition-shadow cursor-default relative"
            onMouseEnter={() => setHoveredKPI(i)}
            onMouseLeave={() => setHoveredKPI(null)}
          >
            {hoveredKPI === i && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#222222] text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
                {kpi.info}
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", kpi.bg, kpi.color)}>
                {kpi.icon}
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-bold",
                kpi.delta >= 0 ? "text-green-600" : "text-red-500"
              )}>
                {kpi.delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(kpi.delta)}%
              </div>
            </div>
            <div className="text-2xl font-black text-[#222222] mb-0.5">{kpi.value}</div>
            <div className="text-xs text-[#717171]">{kpi.label}</div>
            <div className="text-[10px] text-[#BBBBBB] mt-0.5">vs {kpi.prev}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Forecast */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[#222222]">Revenus quotidiens</h3>
              <p className="text-xs text-[#717171] mt-0.5">Évolution sur {period}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#717171]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#FF5A5F]" /> Revenus
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#717171]">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Taux d'occ.
              </div>
            </div>
          </div>
          <div className="relative">
            <MiniBar values={d.revenue} color="#FF5A5F" />
            {/* Occupancy overlay line */}
            <div className="absolute inset-0 flex items-end gap-0.5 pointer-events-none">
              {d.occupancy.slice(0, d.revenue.length).map((v, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div className="w-full bg-blue-400/20 rounded-sm" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            {monthLabels[period].map((l, i) => (
              <span key={i} className="text-[10px] text-[#BBBBBB]">{l}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <div className="mb-4">
            <h3 className="font-bold text-[#222222]">Prévisions revenus</h3>
            <p className="text-xs text-[#717171] mt-0.5">IA — confiance 87%</p>
          </div>
          <ForecastChart data={d.forecast} />
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[#717171]">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#FF5A5F]" /> Réel
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#717171]">
              <div className="w-2.5 h-2.5 border-2 border-dashed border-[#FF5A5F]/40 rounded-sm" /> Prévision
            </div>
          </div>
        </div>
      </div>

      {/* Channels + Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue by channel */}
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <h3 className="font-bold text-[#222222] mb-4">Revenus par canal</h3>
          <div className="space-y-3">
            {d.channels.map((ch, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#222222]">{ch.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#222222]">{ch.rev.toLocaleString("fr-FR")}€</span>
                    <span className="text-xs text-[#717171]">{ch.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[#F7F7F7] rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", ch.color)} style={{ width: `${ch.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F7F7F7]">
            <div className="flex justify-between text-sm">
              <span className="text-[#717171]">Total</span>
              <span className="font-black text-[#222222]">
                {d.channels.reduce((s, c) => s + c.rev, 0).toLocaleString("fr-FR")}€
              </span>
            </div>
          </div>
        </div>

        {/* Occupancy heatmap */}
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <h3 className="font-bold text-[#222222] mb-1">Carte d'occupation</h3>
          <p className="text-xs text-[#717171] mb-4">Intensité d'occupation par jour</p>
          <OccupancyHeatmap data={d.heatmap} />
        </div>
      </div>

      {/* Per-property table */}
      <div className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDDDDD] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#222222]">Performance par propriété</h3>
            <p className="text-xs text-[#717171] mt-0.5">KPIs financiers individuels</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F7F7F7]">
                {["Propriété", "Revenus", "Occupation", "ADR", "RevPAR", "Nuits", "Note"].map((h, i) => (
                  <th key={h} className={cn("px-5 py-3 text-xs font-bold text-[#717171] uppercase tracking-wide", i === 0 ? "text-left" : "text-right")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.properties.map((p, i) => (
                <tr key={i} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-[#222222]">{p.name}</div>
                    <div className="text-xs text-[#717171]">{p.city}</div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-bold text-[#222222]">{p.revenue.toLocaleString("fr-FR")}€</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#F7F7F7] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.occ}%` }} />
                      </div>
                      <span className="font-semibold text-[#222222] w-8">{p.occ}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-[#222222]">{p.adr}€</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-bold text-purple-600">{p.revpar}€</span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#717171]">{p.nights}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-[#222222]">{p.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F7F7F7] border-t border-[#DDDDDD]">
                <td className="px-5 py-3 font-bold text-[#222222]">Total</td>
                <td className="px-5 py-3 text-right font-black text-[#FF5A5F]">
                  {d.properties.reduce((s, p) => s + p.revenue, 0).toLocaleString("fr-FR")}€
                </td>
                <td className="px-5 py-3 text-right font-bold text-[#222222]">
                  {Math.round(d.properties.reduce((s, p) => s + p.occ, 0) / d.properties.length)}% moy.
                </td>
                <td className="px-5 py-3 text-right font-bold text-[#222222]">
                  {Math.round(d.properties.reduce((s, p) => s + p.adr, 0) / d.properties.length)}€ moy.
                </td>
                <td className="px-5 py-3 text-right font-bold text-purple-600">
                  {Math.round(d.properties.reduce((s, p) => s + p.revpar, 0) / d.properties.length)}€ moy.
                </td>
                <td className="px-5 py-3 text-right font-bold text-[#222222]">
                  {d.properties.reduce((s, p) => s + p.nights, 0)}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-[#222222]">
                      {(d.properties.reduce((s, p) => s + p.rating, 0) / d.properties.length).toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

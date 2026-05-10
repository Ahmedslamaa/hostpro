"use client";
import { useEffect, useState } from "react";
import { calendarApi, propertiesApi } from "@/lib/api";
import { CalendarEvent, Property } from "@/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  manual: "#1e293b", airbnb: "#ff5a5f", booking: "#003580", abritel: "#00adef",
  ical: "#6366f1", reservation: "#1e293b", block: "#94a3b8",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showBlock, setShowBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({ property_id: "", start_date: "", end_date: "", title: "Blocage" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadEvents = async () => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = getDaysInMonth(year, month);
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;
    setLoading(true);
    const [e, p] = await Promise.all([calendarApi.get({ start, end }), propertiesApi.list()]);
    setEvents(e.data);
    setProperties(p.data);
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, [year, month]);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));

  const getEventsForDay = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start_date <= d && e.end_date > d);
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await calendarApi.block(blockForm);
    setShowBlock(false);
    setBlockForm({ property_id: "", start_date: "", end_date: "", title: "Blocage" });
    loadEvents();
  };

  const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendrier</h1>
          <p className="text-slate-500 text-sm mt-0.5">Vue multi-biens</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1.5 hover:bg-slate-100 rounded">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-medium text-slate-900 w-36 text-center">
              {MONTHS_FR[month]} {year}
            </span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1.5 hover:bg-slate-100 rounded">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => setShowBlock(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
            <Plus size={16} /> Bloquer
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {Object.entries(SOURCE_COLORS).filter(([k]) => ["airbnb", "booking", "abritel", "manual", "block"].includes(k)).map(([k, c]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            {k === "manual" ? "Direct/Manuel" : k === "block" ? "Blocage" : k.charAt(0).toUpperCase() + k.slice(1)}
          </div>
        ))}
      </div>

      {showBlock && (
        <form onSubmit={handleBlock} className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Bien</label>
            <select required className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={blockForm.property_id} onChange={(e) => setBlockForm({ ...blockForm, property_id: e.target.value })}>
              <option value="">Sélectionner</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Du</label>
            <input type="date" required className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={blockForm.start_date} onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Au</label>
            <input type="date" required className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={blockForm.end_date} onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Motif</label>
            <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={blockForm.title} onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowBlock(false)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">Annuler</button>
            <button type="submit" className="bg-slate-900 text-white rounded-lg px-3 py-2 text-sm">Bloquer</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-3">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const today = new Date();
            const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const dayEvents = day ? getEventsForDay(day) : [];
            return (
              <div key={i} className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${!day ? "bg-slate-50" : ""}`}>
                {day && (
                  <>
                    <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-slate-900 text-white" : "text-slate-700"}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div key={e.id} className="text-xs px-1.5 py-0.5 rounded truncate text-white" style={{ backgroundColor: SOURCE_COLORS[e.source] || "#1e293b" }}>
                          {e.title || propMap[e.property_id]?.substring(0, 12) || e.event_type}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 3}</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

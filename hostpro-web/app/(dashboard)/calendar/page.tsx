"use client";
import { useEffect, useState } from "react";
import { calendarApi } from "@/lib/api";
import { CalendarEvent, Property } from "@/types";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const SOURCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  manual: { color: "#222222", bg: "bg-neutral-900/10", label: "Direct/Manuel" },
  airbnb: { color: "#FF5A5F", bg: "bg-primary-500/20", label: "Airbnb" },
  booking: { color: "#003580", bg: "bg-blue-100", label: "Booking" },
  abritel: { color: "#00adef", bg: "bg-cyan-100", label: "Abritel" },
  ical: { color: "#6366f1", bg: "bg-indigo-100", label: "iCal" },
  reservation: { color: "#FF5A5F", bg: "bg-primary-500/20", label: "Réservation" },
  block: { color: "#717171", bg: "bg-[#717171]/10", label: "Blocage" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showBlock, setShowBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({
    property_id: "",
    start_date: "",
    end_date: "",
    title: "Blocage",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadEvents = async () => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = getDaysInMonth(year, month);
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;
    setLoading(true);
    try {
      const [e, p] = await Promise.all([
        fetch(`/api/v1/calendar?start=${start}&end=${end}`).then(r => r.json()),
        fetch("/api/v1/properties").then(r => r.json()),
      ]);
      setEvents(Array.isArray(e) ? e : []);
      setProperties(Array.isArray(p) ? p : []);
    } catch { setEvents([]); setProperties([]); }
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, [year, month]);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));

  const getEventsForDay = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e: any) => (e.start_date ?? e.start) <= d && (e.end_date ?? e.end) > d);
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await calendarApi.block(blockForm);
    setShowBlock(false);
    setBlockForm({ property_id: "", start_date: "", end_date: "", title: "Blocage" });
    loadEvents();
  };

  const goToday = () => setCurrentDate(new Date());

  const inputClass =
    "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder-[#717171] focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all";

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-sm font-semibold text-neutral-900 w-40 text-center">
              {MONTHS_FR[month]} {year}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="border border-neutral-200 text-neutral-900 font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-100 transition-all text-sm"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden xl:flex items-center gap-3">
            {Object.entries(SOURCE_CONFIG)
              .filter(([k]) => ["airbnb", "booking", "block", "manual"].includes(k))
              .map(([k, cfg]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                </div>
              ))}
          </div>

          <button
            onClick={() => setShowBlock(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
          >
            <Plus size={16} /> Bloquer des dates
          </button>
        </div>
      </div>

      {/* Block form */}
      {showBlock && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Bloquer des dates</h3>
            <button onClick={() => setShowBlock(false)} className="text-neutral-500 hover:text-neutral-900 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleBlock} className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">Propriété</label>
              <select
                required
                className={inputClass + " w-full"}
                value={blockForm.property_id}
                onChange={(e) => setBlockForm({ ...blockForm, property_id: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">Du</label>
              <input
                type="date"
                required
                className={inputClass + " w-full"}
                value={blockForm.start_date}
                onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">Au</label>
              <input
                type="date"
                required
                className={inputClass + " w-full"}
                value={blockForm.end_date}
                onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-neutral-900 text-sm font-semibold mb-2 block">Motif</label>
              <input
                className={inputClass + " w-full"}
                value={blockForm.title}
                onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBlock(false)}
                className="flex-1 border border-neutral-200 text-neutral-900 font-semibold py-2.5 rounded-xl hover:bg-neutral-100 transition-all text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Bloquer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-100">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wide py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {loading ? (
          <div className="grid grid-cols-7">
            {Array(35).fill(null).map((_, i) => (
              <div key={i} className="min-h-[110px] border-b border-r border-neutral-200 p-2 animate-pulse bg-neutral-100/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const today = new Date();
              const isToday =
                day &&
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
              const dayEvents = day ? getEventsForDay(day) : [];

              return (
                <div
                  key={i}
                  className={`min-h-[110px] border-b border-r border-neutral-200 p-2 ${
                    !day ? "bg-neutral-100/40" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1.5 ${
                          isToday
                            ? "bg-primary-500 text-white"
                            : "text-neutral-900 hover:bg-neutral-100"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => {
                          const cfg = SOURCE_CONFIG[e.source] || SOURCE_CONFIG.manual;
                          return (
                            <div
                              key={e.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate font-medium border-l-2`}
                              style={{
                                backgroundColor: `${cfg.color}20`,
                                color: cfg.color,
                                borderLeftColor: cfg.color,
                              }}
                            >
                              {e.title || propMap[e.property_id]?.substring(0, 12) || e.event_type}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-neutral-500 px-1 font-medium">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { calendarApi } from "@/lib/api";
import { CalendarEvent, Property } from "@/types";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

const SOURCE_CONFIG: Record<string, { color: string; label: string }> = {
  manual:      { color: "#1A0E12", label: "Direct/Manuel" },
  airbnb:      { color: "#E02060", label: "Airbnb" },
  booking:     { color: "#003580", label: "Booking" },
  abritel:     { color: "#00adef", label: "Abritel" },
  ical:        { color: "#6366f1", label: "iCal" },
  reservation: { color: "#E02060", label: "Réservation" },
  block:       { color: "#6B5A60", label: "Blocage" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
  padding: "10px 12px", fontSize: 13, color: INK,
  background: "white", fontFamily: "inherit", outline: "none",
};

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

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1" style={{
            background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 4,
          }}>
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: INK_SOFT }}
            >
              <ChevronLeft size={15} />
            </button>
            <span style={{ padding: "0 16px", fontSize: 13, fontWeight: 700, color: INK, width: 160, textAlign: "center" }}>
              {MONTHS_FR[month]} {year}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: INK_SOFT }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <button
            onClick={goToday}
            style={{
              border: "1px solid rgba(0,0,0,0.1)", color: INK, fontWeight: 600,
              padding: "9px 16px", borderRadius: 12, background: "white", cursor: "pointer", fontSize: 13,
            }}
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
                <div key={k} className="flex items-center gap-1.5" style={{ fontSize: 11, color: INK_SOFT }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color }} />
                  {cfg.label}
                </div>
              ))}
          </div>

          <button
            onClick={() => setShowBlock(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: INK, color: "#F4F2F0",
              borderRadius: 12, padding: "10px 18px",
              fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
            }}
          >
            <Plus size={15} /> Bloquer des dates
          </button>
        </div>
      </div>

      {/* Block form */}
      {showBlock && (
        <div style={{
          background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
          padding: 22, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700, color: INK }}>Bloquer des dates</h3>
            <button onClick={() => setShowBlock(false)} style={{ color: INK_SOFT, background: "none", border: "none", cursor: "pointer" }}>
              <X size={17} />
            </button>
          </div>
          <form onSubmit={handleBlock} className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Propriété</label>
              <select
                required
                style={{ ...inputStyle, width: "100%" }}
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
              <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Du</label>
              <input
                type="date" required
                style={{ ...inputStyle, width: "100%" }}
                value={blockForm.start_date}
                onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Au</label>
              <input
                type="date" required
                style={{ ...inputStyle, width: "100%" }}
                value={blockForm.end_date}
                onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Motif</label>
              <input
                style={{ ...inputStyle, width: "100%" }}
                value={blockForm.title}
                onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBlock(false)}
                style={{
                  flex: 1, border: "1px solid rgba(0,0,0,0.1)", color: INK, fontWeight: 600,
                  padding: "10px 0", borderRadius: 12, background: "white", cursor: "pointer", fontSize: 13,
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  flex: 1, background: ROSE, color: "white", fontWeight: 700,
                  padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13,
                }}
              >
                Bloquer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: PAPER }}>
          {DAYS_FR.map((d) => (
            <div key={d} style={{
              textAlign: "center", fontSize: 10, fontWeight: 700, color: INK_SOFT,
              textTransform: "uppercase", letterSpacing: "0.12em", padding: "12px 0",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {loading ? (
          <div className="grid grid-cols-7">
            {Array(35).fill(null).map((_, i) => (
              <div key={i} style={{ minHeight: 110, borderBottom: "1px solid rgba(0,0,0,0.04)", borderRight: "1px solid rgba(0,0,0,0.04)", padding: 8 }} className="animate-pulse" />
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
                  style={{
                    minHeight: 110, borderBottom: "1px solid rgba(0,0,0,0.04)",
                    borderRight: "1px solid rgba(0,0,0,0.04)", padding: 8,
                    background: !day ? "rgba(26,14,18,0.02)" : "transparent",
                  }}
                >
                  {day && (
                    <>
                      <div style={{
                        fontSize: 12, fontWeight: 700, width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%", marginBottom: 6,
                        background: isToday ? ROSE : "transparent",
                        color: isToday ? "white" : INK,
                      }}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => {
                          const cfg = SOURCE_CONFIG[e.source] || SOURCE_CONFIG.manual;
                          return (
                            <div
                              key={e.id}
                              style={{
                                fontSize: 10, padding: "2px 6px", borderRadius: 4,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                fontWeight: 600, borderLeft: `2px solid ${cfg.color}`,
                                background: `${cfg.color}18`, color: cfg.color,
                              }}
                            >
                              {e.title || propMap[e.property_id]?.substring(0, 12) || e.event_type}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div style={{ fontSize: 10, color: INK_SOFT, paddingLeft: 4, fontWeight: 600 }}>+{dayEvents.length - 3}</div>
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

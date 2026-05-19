"use client";
import { useEffect, useState } from "react";
import { tasksApi } from "@/lib/api";
import { Task, Property } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, X, CheckCircle2 } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const GOLD = "#E0C080";
const GOLD_DEEP = "#C0A060";
const PAPER = "#F4F2F0";

const TASK_TYPE_LABELS: Record<string, string> = {
  cleaning: "Ménage",
  maintenance: "Maintenance",
  checkin: "Check-in",
  checkout: "Check-out",
  other: "Autre",
};

const PRIORITY_CONFIG: Record<string, { label: string; style: React.CSSProperties }> = {
  urgent: { label: "Urgent", style: { background: "rgba(192,0,64,0.1)", color: "#C00040" } },
  high:   { label: "Haute",  style: { background: "rgba(192,0,64,0.1)", color: "#C00040" } },
  normal: { label: "Normal", style: { background: "rgba(192,160,96,0.15)", color: "#C0A060" } },
  low:    { label: "Basse",  style: { background: "rgba(27,122,74,0.1)", color: "#1B7A4A" } },
};

const COLUMNS = [
  { id: "pending",     label: "À faire", dotColor: GOLD_DEEP },
  { id: "in_progress", label: "En cours", dotColor: ROSE },
  { id: "done",        label: "Terminé",  dotColor: "#1B7A4A" },
];

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 10,
  padding: "12px 14px",
  background: "white",
  fontFamily: "inherit",
  fontSize: 14,
  color: INK,
  outline: "none",
  width: "100%",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    task_type: "cleaning",
    priority: "normal",
    property_id: "",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        fetch("/api/v1/tasks").then(r => r.json()),
        fetch("/api/v1/properties").then(r => r.json()),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setProperties(Array.isArray(p) ? p : []);
    } catch { setTasks([]); setProperties([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));

  const handleComplete = async (id: string) => {
    await tasksApi.complete(id);
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await tasksApi.create({
      ...newTask,
      property_id: newTask.property_id || undefined,
      due_date: newTask.due_date || undefined,
    });
    setShowNew(false);
    setNewTask({ title: "", task_type: "cleaning", priority: "normal", property_id: "", due_date: "" });
    load();
    setSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p style={{ fontSize: 13, color: INK_SOFT }}>
          {tasks.length} tâche{tasks.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowNew(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: INK, color: "#F4F2F0",
            borderRadius: 12, padding: "10px 18px",
            fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
          }}
        >
          <Plus size={15} />
          Nouvelle tâche
        </button>
      </div>

      {/* New task form */}
      {showNew && (
        <div style={{
          background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
          padding: 22, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Nouvelle tâche
            </h3>
            <button onClick={() => setShowNew(false)} style={{ color: INK_SOFT, background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Titre de la tâche</label>
                <input
                  required
                  placeholder="Ex: Ménage complet appartement"
                  style={inputStyle}
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Type</label>
                <select style={inputStyle} value={newTask.task_type} onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}>
                  {Object.entries(TASK_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Priorité</label>
                <select style={inputStyle} value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Propriété (optionnel)</label>
                <select style={inputStyle} value={newTask.property_id} onChange={(e) => setNewTask({ ...newTask, property_id: e.target.value })}>
                  <option value="">Aucune</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Date d'échéance</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)", color: INK, fontWeight: 600,
                  padding: "10px 18px", borderRadius: 12, background: "white", cursor: "pointer", fontSize: 13,
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: ROSE, color: "white", fontWeight: 700,
                  padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontSize: 13, opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Création..." : "Créer la tâche"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban board */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: PAPER, borderRadius: 18, padding: 16 }} className="space-y-3">
              <div className="h-6 bg-white rounded-xl animate-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-24 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} style={{ background: PAPER, borderRadius: 18, padding: 16 }}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.dotColor, flexShrink: 0 }} />
                    <h3 style={{ fontWeight: 700, color: INK, fontSize: 13 }}>{col.label}</h3>
                  </div>
                  <span style={{
                    background: "white", color: INK_SOFT, fontSize: 11, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(0,0,0,0.08)",
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div style={{
                      background: "white", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)",
                      padding: 16, textAlign: "center", color: INK_SOFT, fontSize: 12,
                    }}>
                      Aucune tâche
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const priorityCfg = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.normal;
                      return (
                        <div
                          key={t.id}
                          style={{
                            background: "white", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)",
                            padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            opacity: t.status === "done" ? 0.6 : 1,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 style={{ fontWeight: 700, color: INK, fontSize: 13, lineHeight: 1.4 }}>{t.title}</h4>
                            {t.status !== "done" && (
                              <button
                                onClick={() => handleComplete(t.id)}
                                style={{ flexShrink: 0, color: "rgba(0,0,0,0.2)", background: "none", border: "none", cursor: "pointer" }}
                                title="Marquer comme terminé"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                          </div>

                          {t.property_id && (
                            <p style={{ fontSize: 11, color: INK_SOFT, marginBottom: 6 }}>{propMap[t.property_id] || "Bien"}</p>
                          )}

                          {t.due_date && (
                            <div className="flex items-center gap-1" style={{ fontSize: 11, color: INK_SOFT, marginBottom: 10 }}>
                              <Calendar size={10} />
                              {formatDate(t.due_date)}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span style={{
                              fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                              padding: "3px 7px", borderRadius: 99,
                              ...priorityCfg.style,
                            }}>
                              {priorityCfg.label}
                            </span>
                            <span style={{
                              fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                              padding: "3px 7px", borderRadius: 99,
                              background: "rgba(26,14,18,0.06)", color: INK_SOFT,
                            }}>
                              {TASK_TYPE_LABELS[t.task_type] || t.task_type}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

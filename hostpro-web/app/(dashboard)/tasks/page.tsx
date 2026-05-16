"use client";
import { useEffect, useState } from "react";
import { tasksApi } from "@/lib/api";
import { Task, Property } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, X, CheckCircle2 } from "lucide-react";

const TASK_TYPE_LABELS: Record<string, string> = {
  cleaning: "Ménage",
  maintenance: "Maintenance",
  checkin: "Check-in",
  checkout: "Check-out",
  other: "Autre",
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  high: { label: "Haute", className: "bg-red-100 text-red-700" },
  normal: { label: "Normal", className: "bg-amber-100 text-amber-700" },
  low: { label: "Basse", className: "bg-green-100 text-green-700" },
};

const COLUMNS = [
  { id: "pending", label: "À faire", dot: "bg-amber-400" },
  { id: "in_progress", label: "En cours", dot: "bg-blue-400" },
  { id: "done", label: "Terminé", dot: "bg-green-400" },
];

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

  const inputClass =
    "border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder-[#717171] focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 w-full text-sm transition-all";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500">
          {tasks.length} tâche{tasks.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} />
          Nouvelle tâche
        </button>
      </div>

      {/* New task form */}
      {showNew && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Nouvelle tâche</h3>
            <button onClick={() => setShowNew(false)} className="text-neutral-500 hover:text-neutral-900 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-neutral-900 text-sm font-semibold mb-2 block">Titre de la tâche</label>
                <input
                  required
                  placeholder="Ex: Ménage complet appartement"
                  className={inputClass}
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-neutral-900 text-sm font-semibold mb-2 block">Type</label>
                <select
                  className={inputClass}
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                >
                  {Object.entries(TASK_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-neutral-900 text-sm font-semibold mb-2 block">Priorité</label>
                <select
                  className={inputClass}
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-neutral-900 text-sm font-semibold mb-2 block">Propriété (optionnel)</label>
                <select
                  className={inputClass}
                  value={newTask.property_id}
                  onChange={(e) => setNewTask({ ...newTask, property_id: e.target.value })}
                >
                  <option value="">Aucune</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-neutral-900 text-sm font-semibold mb-2 block">Date d'échéance</label>
                <input
                  type="date"
                  className={inputClass}
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="border border-neutral-200 text-neutral-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-all text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
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
            <div key={i} className="bg-neutral-100 rounded-2xl p-4 space-y-3">
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
              <div key={col.id} className="bg-neutral-100 rounded-2xl p-4">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className="font-semibold text-neutral-900 text-sm">{col.label}</h3>
                  </div>
                  <span className="bg-white text-neutral-500 text-xs font-semibold px-2 py-0.5 rounded-full border border-neutral-200">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center text-neutral-500 text-xs">
                      Aucune tâche
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const priorityCfg = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.normal;
                      return (
                        <div
                          key={t.id}
                          className={`bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow ${
                            t.status === "done" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-neutral-900 text-sm leading-snug">{t.title}</h4>
                            {t.status !== "done" && (
                              <button
                                onClick={() => handleComplete(t.id)}
                                className="flex-shrink-0 text-[#DDDDDD] hover:text-green-500 transition-colors"
                                title="Marquer comme terminé"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                          </div>

                          {t.property_id && (
                            <p className="text-xs text-neutral-500 mb-2">{propMap[t.property_id] || "Bien"}</p>
                          )}

                          {t.due_date && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3">
                              <Calendar size={11} />
                              {formatDate(t.due_date)}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityCfg.className}`}>
                              {priorityCfg.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-500">
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

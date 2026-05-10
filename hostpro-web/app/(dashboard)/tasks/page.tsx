"use client";
import { useEffect, useState } from "react";
import { tasksApi, propertiesApi } from "@/lib/api";
import { Task, Property } from "@/types";
import { statusColor, formatDate } from "@/lib/utils";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";

const TASK_TYPE_LABELS: Record<string, string> = {
  cleaning: "Ménage", maintenance: "Maintenance", checkin: "Check-in",
  checkout: "Check-out", other: "Autre",
};
const PRIORITY_LABELS: Record<string, string> = { urgent: "Urgent", high: "Haute", normal: "Normal", low: "Basse" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", task_type: "cleaning", priority: "normal", property_id: "", due_date: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, p] = await Promise.all([tasksApi.list({ status: statusFilter || undefined }), propertiesApi.list()]);
    setTasks(t.data);
    setProperties(p.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));

  const handleComplete = async (id: string) => {
    await tasksApi.complete(id);
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await tasksApi.create({ ...newTask, property_id: newTask.property_id || undefined, due_date: newTask.due_date || undefined });
    setShowNew(false);
    setNewTask({ title: "", task_type: "cleaning", priority: "normal", property_id: "", due_date: "" });
    load();
    setSaving(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tâches opérationnelles</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tasks.length} tâche{tasks.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
          <Plus size={16} /> Nouvelle tâche
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[["", "Toutes"], ["pending", "À faire"], ["in_progress", "En cours"], ["done", "Terminées"]].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === v ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}>
            {l}
          </button>
        ))}
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-5 mb-4 space-y-3">
          <h3 className="font-semibold text-slate-900">Nouvelle tâche</h3>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Titre de la tâche" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={newTask.task_type} onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}>
              {Object.entries(TASK_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={newTask.property_id} onChange={(e) => setNewTask({ ...newTask, property_id: e.target.value })}>
              <option value="">Bien (optionnel)</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Aucune tâche</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 ${t.status === "done" ? "opacity-60" : ""}`}>
              <button onClick={() => t.status !== "done" && handleComplete(t.id)} className="flex-shrink-0">
                {t.status === "done" ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300 hover:text-slate-500" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{t.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {TASK_TYPE_LABELS[t.task_type]}
                  {t.property_id && <> · {propMap[t.property_id] || "Bien"}</>}
                  {t.due_date && <> · Échéance : {formatDate(t.due_date)}</>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.priority)}`}>
                  {PRIORITY_LABELS[t.priority]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                  {t.status === "pending" ? "À faire" : t.status === "in_progress" ? "En cours" : "Terminé"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

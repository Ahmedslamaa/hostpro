"use client";
import { useState } from "react";
import {
  CheckCircle, Clock, AlertTriangle, Play, Pause, Plus, X,
  Home, Users, Wrench, Key, Sparkles, Zap, ArrowRight,
  Bell, Mail, MessageSquare, Phone, CalendarDays, Shield,
  Settings2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight,
  Trash2, Copy, Edit3, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type TriggerType =
  | "reservation_confirmed"
  | "checkin_24h"
  | "checkin_day"
  | "checkout_day"
  | "checkout_after"
  | "review_received"
  | "message_received"
  | "maintenance_reported";

type ActionType =
  | "send_message"
  | "send_email"
  | "send_sms"
  | "send_whatsapp"
  | "create_task"
  | "notify_team"
  | "generate_code"
  | "block_calendar";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  actions: { type: ActionType; config: string }[];
  enabled: boolean;
  runs: number;
  lastRun?: string;
  property: "all" | string;
  category: "checkin" | "checkout" | "cleaning" | "maintenance" | "communication" | "review";
}

interface Task {
  id: string;
  title: string;
  property: string;
  assignee: string;
  type: "cleaning" | "maintenance" | "checkin" | "checkout";
  dueDate: string;
  dueTime: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "normal" | "urgent";
  notes?: string;
  autoCreated?: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  reservation_confirmed: { label: "Réservation confirmée", icon: <CheckCircle size={14} />, color: "text-green-700", bg: "bg-green-50" },
  checkin_24h:           { label: "24h avant check-in",    icon: <Clock size={14} />,       color: "text-blue-700",  bg: "bg-blue-50" },
  checkin_day:           { label: "Jour du check-in",      icon: <Key size={14} />,         color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10" },
  checkout_day:          { label: "Jour du check-out",     icon: <Home size={14} />,        color: "text-amber-700", bg: "bg-amber-50" },
  checkout_after:        { label: "Après le check-out",    icon: <CalendarDays size={14} />,color: "text-orange-700",bg: "bg-orange-50" },
  review_received:       { label: "Avis reçu",             icon: <Sparkles size={14} />,    color: "text-yellow-700",bg: "bg-yellow-50" },
  message_received:      { label: "Message reçu",          icon: <MessageSquare size={14} />, color: "text-purple-700", bg: "bg-purple-50" },
  maintenance_reported:  { label: "Incident signalé",      icon: <Wrench size={14} />,      color: "text-red-700",   bg: "bg-red-50" },
};

const ACTION_LABELS: Record<ActionType, { label: string; icon: React.ReactNode; color: string }> = {
  send_message:   { label: "Envoyer message",    icon: <MessageSquare size={12} />, color: "text-[#FF5A5F]" },
  send_email:     { label: "Envoyer email",      icon: <Mail size={12} />,          color: "text-amber-600" },
  send_sms:       { label: "Envoyer SMS",        icon: <Phone size={12} />,         color: "text-green-600" },
  send_whatsapp:  { label: "WhatsApp",           icon: <Phone size={12} />,         color: "text-green-700" },
  create_task:    { label: "Créer tâche",        icon: <CheckCircle size={12} />,   color: "text-blue-600" },
  notify_team:    { label: "Notifier équipe",    icon: <Bell size={12} />,          color: "text-purple-600" },
  generate_code:  { label: "Générer code accès", icon: <Key size={12} />,           color: "text-[#222222]" },
  block_calendar: { label: "Bloquer calendrier", icon: <CalendarDays size={12} />,  color: "text-red-600" },
};

const WORKFLOWS: Workflow[] = [
  {
    id: "w1", name: "Bienvenue automatique", enabled: true, runs: 142, lastRun: "Il y a 2h", property: "all",
    category: "communication", description: "Message de bienvenue dès confirmation de réservation",
    trigger: "reservation_confirmed",
    actions: [
      { type: "send_message", config: "Message bienvenue avec détails propriété" },
      { type: "send_email",   config: "Email confirmation avec guide PDF" },
    ],
  },
  {
    id: "w2", name: "Code d'accès J-1", enabled: true, runs: 98, lastRun: "Il y a 4h", property: "all",
    category: "checkin", description: "Envoie le code d'accès 24h avant l'arrivée",
    trigger: "checkin_24h",
    actions: [
      { type: "generate_code", config: "Code 4 chiffres unique par séjour" },
      { type: "send_message",  config: "Message avec code + instructions accès" },
      { type: "send_sms",      config: "SMS de rappel avec code" },
    ],
  },
  {
    id: "w3", name: "Check-in express", enabled: true, runs: 87, lastRun: "Aujourd'hui 09:00", property: "all",
    category: "checkin", description: "Instructions détaillées le matin du check-in",
    trigger: "checkin_day",
    actions: [
      { type: "send_whatsapp", config: "Guide d'accès complet (WiFi, parking, règles)" },
      { type: "notify_team",   config: "Alerte à la femme de ménage — vérification prête" },
    ],
  },
  {
    id: "w4", name: "Ménage post-séjour", enabled: true, runs: 203, lastRun: "Aujourd'hui 11:00", property: "all",
    category: "cleaning", description: "Création automatique de la tâche de ménage au check-out",
    trigger: "checkout_day",
    actions: [
      { type: "create_task",  config: "Tâche ménage urgente pour femme de ménage" },
      { type: "notify_team",  config: "Notification équipe ménage avec heure de départ" },
      { type: "send_message", config: "Message de remerciement au voyageur" },
    ],
  },
  {
    id: "w5", name: "Demande d'avis", enabled: true, runs: 156, lastRun: "Il y a 6h", property: "all",
    category: "review", description: "Sollicite un avis 2h après le check-out",
    trigger: "checkout_after",
    actions: [
      { type: "send_message", config: "Message de remerciement + lien avis Airbnb" },
      { type: "send_email",   config: "Email de satisfaction avec lien évaluation" },
    ],
  },
  {
    id: "w6", name: "Réponse maintenance", enabled: false, runs: 14, lastRun: "Il y a 3j", property: "Villa Azur",
    category: "maintenance", description: "Alerte et création tâche si incident signalé",
    trigger: "maintenance_reported",
    actions: [
      { type: "create_task",  config: "Ticket maintenance prioritaire" },
      { type: "notify_team",  config: "Alerte gestionnaire + technicien disponible" },
      { type: "send_message", config: "Message voyageur avec délai d'intervention" },
    ],
  },
];

const TODAY_TASKS: Task[] = [
  { id: "t1", title: "Ménage complet — Villa Azur", property: "Villa Azur", assignee: "Marie L.", type: "cleaning", dueDate: "Aujourd'hui", dueTime: "11:00", status: "in_progress", priority: "urgent", autoCreated: true, notes: "Sophie Martin départ 10:00 · Anna Kowalski arrivée 15:00" },
  { id: "t2", title: "Préparation check-in Dupont", property: "Penthouse Côte", assignee: "Marc T.", type: "checkin", dueDate: "Aujourd'hui", dueTime: "14:00", status: "todo", priority: "normal", autoCreated: true, notes: "Code: 7749 · Vérifier climatisation" },
  { id: "t3", title: "Remplacement serviettes Apt. Bellevue", property: "Apt. Bellevue", assignee: "Marie L.", type: "cleaning", dueDate: "Aujourd'hui", dueTime: "16:00", status: "todo", priority: "normal" },
  { id: "t4", title: "Inspection suite Penthouse", property: "Penthouse Côte", assignee: "Thomas R.", type: "maintenance", dueDate: "Aujourd'hui", dueTime: "09:00", status: "done", priority: "urgent", notes: "Problème signalé par voyageur précédent — robinet salle de bain" },
  { id: "t5", title: "Check-out Thibault — Studio Antibes", property: "Studio Antibes", assignee: "Auto", type: "checkout", dueDate: "Aujourd'hui", dueTime: "10:00", status: "done", priority: "normal", autoCreated: true },
];

const CATEGORY_TABS = [
  { id: "all",           label: "Tout",            icon: <Zap size={14} /> },
  { id: "checkin",       label: "Check-in",        icon: <Key size={14} /> },
  { id: "checkout",      label: "Check-out",       icon: <Home size={14} /> },
  { id: "cleaning",      label: "Ménage",          icon: <Sparkles size={14} /> },
  { id: "maintenance",   label: "Maintenance",     icon: <Wrench size={14} /> },
  { id: "communication", label: "Communication",   icon: <MessageSquare size={14} /> },
  { id: "review",        label: "Avis",            icon: <Sparkles size={14} /> },
] as const;

const TASK_COLORS: Record<Task["type"], { bg: string; text: string; label: string }> = {
  cleaning:    { bg: "bg-blue-50",   text: "text-blue-700",   label: "Ménage" },
  maintenance: { bg: "bg-orange-50", text: "text-orange-700", label: "Maintenance" },
  checkin:     { bg: "bg-green-50",  text: "text-green-700",  label: "Check-in" },
  checkout:    { bg: "bg-amber-50",  text: "text-amber-700",  label: "Check-out" },
};

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low:    "bg-[#F7F7F7] text-[#717171]",
  normal: "bg-blue-50 text-blue-700",
  urgent: "bg-red-50 text-red-700",
};

// ── Create workflow modal ──────────────────────────────────────────────────────

function CreateWorkflowModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: Workflow) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<TriggerType>("reservation_confirmed");
  const [actions, setActions] = useState<ActionType[]>(["send_message"]);
  const [property, setProperty] = useState<"all" | string>("all");

  const handleCreate = () => {
    onAdd({
      id: `w${Date.now()}`, name, enabled: true, runs: 0, property,
      category: "communication", description: `Automatisation personnalisée — ${TRIGGER_LABELS[trigger].label}`,
      trigger,
      actions: actions.map(a => ({ type: a, config: ACTION_LABELS[a].label })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <div>
            <h2 className="font-bold text-[#222222]">Créer une automatisation</h2>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map(s => (
                <div key={s} className={cn("w-16 h-1 rounded-full transition-colors", step >= s ? "bg-[#FF5A5F]" : "bg-[#DDDDDD]")} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F7F7F7] text-[#717171]">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#222222]">1. Nom et propriété</h3>
              <div>
                <label className="text-xs font-bold text-[#222222] mb-1.5 block">Nom de l'automatisation</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Message de bienvenue" autoFocus
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF5A5F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#222222] mb-1.5 block">Propriété</label>
                <select value={property} onChange={e => setProperty(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF5A5F]">
                  <option value="all">Toutes les propriétés</option>
                  {["Villa Azur", "Penthouse Côte", "Apt. Bellevue", "Studio Antibes"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button onClick={() => name && setStep(2)} disabled={!name}
                className="w-full bg-[#FF5A5F] hover:bg-[#E00B41] disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Suivant <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#222222]">2. Déclencheur (SI…)</h3>
              <div className="space-y-2">
                {(Object.entries(TRIGGER_LABELS) as [TriggerType, typeof TRIGGER_LABELS[TriggerType]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setTrigger(k)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                      trigger === k ? "border-[#FF5A5F] bg-[#FF5A5F]/5" : "border-[#DDDDDD] hover:border-[#AAAAAA]"
                    )}>
                    <span className={cn("flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center", v.bg, v.color)}>{v.icon}</span>
                    <span className={cn("text-sm font-semibold", trigger === k ? "text-[#FF5A5F]" : "text-[#222222]")}>{v.label}</span>
                    {trigger === k && <CheckCircle size={16} className="ml-auto text-[#FF5A5F]" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F7F7F7]">Retour</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Suivant</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#222222]">3. Actions (ALORS…)</h3>
              <div className="space-y-2">
                {(Object.entries(ACTION_LABELS) as [ActionType, typeof ACTION_LABELS[ActionType]][]).map(([k, v]) => {
                  const checked = actions.includes(k);
                  return (
                    <button key={k} onClick={() => setActions(prev => checked ? prev.filter(a => a !== k) : [...prev, k])}
                      className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left",
                        checked ? "border-[#FF5A5F] bg-[#FF5A5F]/5" : "border-[#DDDDDD] hover:border-[#AAAAAA]"
                      )}>
                      <span className={cn("flex-shrink-0", checked ? "text-[#FF5A5F]" : v.color)}>{v.icon}</span>
                      <span className={cn("text-sm font-semibold", checked ? "text-[#FF5A5F]" : "text-[#222222]")}>{v.label}</span>
                      {checked && <CheckCircle size={14} className="ml-auto text-[#FF5A5F]" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F7F7F7]">Retour</button>
                <button onClick={handleCreate} disabled={actions.length === 0}
                  className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Zap size={14} className="inline mr-1" /> Créer l'automatisation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS);
  const [tasks, setTasks] = useState<Task[]>(TODAY_TASKS);
  const [tab, setTab] = useState<"workflows" | "tasks">("workflows");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const filteredWorkflows = workflows.filter(w => catFilter === "all" || w.category === catFilter);

  const taskStats = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
    urgent: tasks.filter(t => t.priority === "urgent" && t.status !== "done").length,
  };

  const enabledCount = workflows.filter(w => w.enabled).length;
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0);

  const INK = "#1A0E12";
  const INK_SOFT = "#6B5A60";
  const ROSE = "#E02060";
  const PAPER = "#F4F2F0";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Automatisation</h1>
          <p style={{ color: INK_SOFT, fontSize: 13, marginTop: 2 }}>Workflows SI/ALORS · Tâches auto · Check-in/out intelligent</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: INK, color: "#F4F2F0", border: "none",
            fontWeight: 700, padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontSize: 13,
          }}>
          <Plus size={15} /> Nouvelle automatisation
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Automatisations actives", value: `${enabledCount}/${workflows.length}`, icon: <Zap size={17} />, color: ROSE, bg: "rgba(224,32,96,0.08)" },
          { label: "Exécutions totales",       value: totalRuns,                            icon: <Play size={17} />, color: "#1B7A4A", bg: "rgba(27,122,74,0.1)" },
          { label: "Tâches du jour",           value: tasks.length,                         icon: <CheckCircle size={17} />, color: "#1d4ed8", bg: "rgba(59,130,246,0.1)" },
          { label: "Urgences en cours",        value: taskStats.urgent,                     icon: <AlertTriangle size={17} />, color: "#C00040", bg: "rgba(192,0,64,0.1)" },
        ].map((k, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
            padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: k.bg, color: k.color }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{k.value}</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 w-fit" style={{ background: PAPER, padding: 4, borderRadius: 14 }}>
        <button onClick={() => setTab("workflows")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10,
            fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
            background: tab === "workflows" ? "white" : "transparent",
            color: tab === "workflows" ? INK : INK_SOFT,
            boxShadow: tab === "workflows" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
          <Zap size={13} /> Workflows ({workflows.length})
        </button>
        <button onClick={() => setTab("tasks")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10,
            fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
            background: tab === "tasks" ? "white" : "transparent",
            color: tab === "tasks" ? INK : INK_SOFT,
            boxShadow: tab === "tasks" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
          <CheckCircle size={13} /> Tâches du jour ({tasks.length})
          {taskStats.urgent > 0 && <span style={{ background: "#C00040", color: "white", fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 99 }}>{taskStats.urgent}</span>}
        </button>
      </div>

      {/* Workflows tab */}
      {tab === "workflows" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORY_TABS.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                  catFilter === c.id ? "bg-[#FF5A5F] text-white border-[#FF5A5F]" : "border-[#DDDDDD] text-[#717171] hover:border-[#FF5A5F]/40 bg-white"
                )}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Workflow cards */}
          <div className="space-y-3">
            {filteredWorkflows.map(w => {
              const trig = TRIGGER_LABELS[w.trigger];
              const isExpanded = expandedId === w.id;
              return (
                <div key={w.id} className={cn(
                  "bg-white rounded-2xl border transition-all",
                  w.enabled ? "border-[#DDDDDD]" : "border-[#EEEEEE] opacity-70"
                )}>
                  {/* Main row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <button onClick={() => toggleWorkflow(w.id)}
                      className={cn("flex-shrink-0 w-10 h-6 rounded-full transition-colors flex items-center",
                        w.enabled ? "bg-green-500" : "bg-[#DDDDDD]"
                      )}>
                      <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform mx-1",
                        w.enabled ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#222222]">{w.name}</span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", trig.bg, trig.color)}>
                          {trig.icon} <span className="ml-0.5">{trig.label}</span>
                        </span>
                        {w.property !== "all" && (
                          <span className="text-[10px] font-medium bg-[#F7F7F7] text-[#717171] px-1.5 py-0.5 rounded-full">{w.property}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#717171] mt-0.5">{w.description}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-[#222222]">{w.runs}</div>
                        <div className="text-[10px] text-[#BBBBBB]">exécutions</div>
                      </div>
                      {w.lastRun && (
                        <div className="text-right hidden md:block">
                          <div className="text-xs text-[#717171]">{w.lastRun}</div>
                          <div className="text-[10px] text-[#BBBBBB]">dernière exec.</div>
                        </div>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : w.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F7F7F7] text-[#717171] transition-colors">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <button onClick={() => deleteWorkflow(w.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-[#BBBBBB] hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded — IF/THEN visualization */}
                  {isExpanded && (
                    <div className="border-t border-[#F7F7F7] px-5 py-4 bg-[#FAFAFA] rounded-b-2xl">
                      <div className="flex items-start gap-4">
                        {/* Trigger */}
                        <div className="flex-shrink-0 w-64">
                          <div className="text-[10px] font-black text-[#BBBBBB] uppercase tracking-widest mb-2">SI…</div>
                          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border-2", trig.bg, `border-current ${trig.color}`)}>
                            {trig.icon}
                            <span className={cn("text-sm font-bold", trig.color)}>{trig.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center pt-8">
                          <ArrowRight size={20} className="text-[#DDDDDD]" />
                        </div>
                        {/* Actions */}
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-[#BBBBBB] uppercase tracking-widest mb-2">ALORS…</div>
                          <div className="space-y-2">
                            {w.actions.map((a, i) => {
                              const act = ACTION_LABELS[a.type];
                              return (
                                <div key={i} className="flex items-start gap-2 bg-white border border-[#DDDDDD] rounded-xl px-3 py-2">
                                  <span className={cn("flex-shrink-0 mt-0.5", act.color)}>{act.icon}</span>
                                  <div>
                                    <div className={cn("text-xs font-bold", act.color)}>{act.label}</div>
                                    <div className="text-[11px] text-[#717171]">{a.config}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Templates */}
          <div className="bg-gradient-to-r from-[#FF5A5F]/5 to-purple-50 border border-[#FF5A5F]/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#FF5A5F]" />
              <h3 className="font-bold text-[#222222]">Templates prêts à l'emploi</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "Séquence pré-arrivée complète", desc: "J-7, J-3, J-1, Jour J", icon: <Key size={14} />, color: "text-[#FF5A5F]" },
                { name: "Pack ménage automatique", desc: "Tâches + notif équipe post-départ", icon: <Sparkles size={14} />, color: "text-blue-600" },
                { name: "Gestion avis 5 étoiles", desc: "Relance intelligente post-séjour", icon: <Bell size={14} />, color: "text-yellow-600" },
                { name: "Urgence maintenance", desc: "Alerte + ticket + message voyageur", icon: <Wrench size={14} />, color: "text-orange-600" },
                { name: "Upsell services", desc: "Propose late checkout, extras", icon: <Zap size={14} />, color: "text-purple-600" },
                { name: "Kit sécurité", desc: "Règles maison + code WiFi + urgences", icon: <Shield size={14} />, color: "text-green-600" },
              ].map((t, i) => (
                <button key={i} onClick={() => setShowCreate(true)}
                  className="flex items-start gap-3 bg-white border border-[#DDDDDD] rounded-xl p-3 text-left hover:border-[#FF5A5F] transition-colors">
                  <span className={cn("flex-shrink-0 mt-0.5", t.color)}>{t.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-[#222222]">{t.name}</div>
                    <div className="text-[10px] text-[#717171]">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks tab */}
      {tab === "tasks" && (
        <div className="space-y-4">
          {/* Task stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "À faire", value: taskStats.todo, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "En cours", value: taskStats.in_progress, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Terminé", value: taskStats.done, color: "text-green-600", bg: "bg-green-50" },
              { label: "Urgences", value: taskStats.urgent, color: "text-red-600", bg: "bg-red-50" },
            ].map((s, i) => (
              <div key={i} className={cn("rounded-xl p-3 text-center", s.bg)}>
                <div className={cn("text-2xl font-black", s.color)}>{s.value}</div>
                <div className="text-xs text-[#717171] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-3">
            {tasks.map(task => {
              const tc = TASK_COLORS[task.type];
              const pc = PRIORITY_COLORS[task.priority];
              return (
                <div key={task.id} className={cn(
                  "bg-white border rounded-2xl p-4 transition-all",
                  task.status === "done" ? "border-green-200 opacity-60" : task.priority === "urgent" ? "border-red-200" : "border-[#DDDDDD]"
                )}>
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                      className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        task.status === "done" ? "bg-green-500 border-green-500" : "border-[#DDDDDD] hover:border-[#FF5A5F]"
                      )}
                    >
                      {task.status === "done" && <CheckCircle size={12} className="text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("font-semibold text-sm", task.status === "done" ? "line-through text-[#BBBBBB]" : "text-[#222222]")}>
                          {task.title}
                        </span>
                        {task.autoCreated && (
                          <span className="text-[9px] font-black bg-[#FF5A5F]/10 text-[#FF5A5F] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap size={8} /> Auto
                          </span>
                        )}
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", tc.bg, tc.text)}>{tc.label}</span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", pc)}>
                          {task.priority === "urgent" ? "🔴 Urgent" : task.priority === "normal" ? "Normal" : "Faible"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#717171]">
                        <span className="flex items-center gap-1"><Home size={10} /> {task.property}</span>
                        <span className="flex items-center gap-1"><Users size={10} /> {task.assignee}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {task.dueTime}</span>
                      </div>
                      {task.notes && (
                        <div className="mt-1.5 text-xs bg-[#F7F7F7] rounded-lg px-2.5 py-1.5 text-[#717171]">
                          📝 {task.notes}
                        </div>
                      )}
                    </div>

                    {/* Status selector */}
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as Task["status"])}
                      className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer",
                        task.status === "done" ? "bg-green-100 text-green-700" :
                        task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      )}
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateWorkflowModal
          onClose={() => setShowCreate(false)}
          onAdd={w => setWorkflows(prev => [w, ...prev])}
        />
      )}
    </div>
  );
}

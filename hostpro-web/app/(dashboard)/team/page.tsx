"use client";
import { useEffect, useState } from "react";
import { teamApi } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import {
  Users, UserPlus, Trash2, X, Calendar, Clock, Star,
  CheckCircle, TrendingUp, Award, Zap, ChevronLeft,
  ChevronRight, BarChart2, Phone, Mail, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  joined_at: string | null;
  invited_at: string | null;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  rating: number;
  tasksCompleted: number;
  availability: Record<string, "available" | "busy" | "off">;
  skills: string[];
  hoursWeek: number;
}

interface Shift {
  staffId: string;
  day: string;
  time: string;
  task: string;
  property: string;
  type: "cleaning" | "checkin" | "maintenance" | "support";
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const DAYS_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "s1", name: "Marie Lavigne", role: "provider", avatar: "ML",
    phone: "+33 6 12 34 56 78", email: "marie.lavigne@team.fr",
    rating: 4.94, tasksCompleted: 147, hoursWeek: 32,
    skills: ["Ménage", "Accueil", "Inventaire"],
    availability: { Lun: "available", Mar: "busy", Mer: "available", Jeu: "available", Ven: "busy", Sam: "available", Dim: "off" },
  },
  {
    id: "s2", name: "Thomas Renard", role: "manager", avatar: "TR",
    phone: "+33 6 98 76 54 32", email: "thomas.renard@team.fr",
    rating: 4.87, tasksCompleted: 89, hoursWeek: 40,
    skills: ["Maintenance", "Plomberie", "Électricité"],
    availability: { Lun: "available", Mar: "available", Mer: "off", Jeu: "available", Ven: "available", Sam: "busy", Dim: "off" },
  },
  {
    id: "s3", name: "Sophie Durand", role: "provider", avatar: "SD",
    phone: "+33 6 55 44 33 22", email: "sophie.durand@team.fr",
    rating: 4.91, tasksCompleted: 203, hoursWeek: 24,
    skills: ["Ménage", "Blanchisserie", "Check-in"],
    availability: { Lun: "off", Mar: "available", Mer: "available", Jeu: "busy", Ven: "available", Sam: "available", Dim: "available" },
  },
  {
    id: "s4", name: "Lucas Petit", role: "manager", avatar: "LP",
    phone: "+33 6 77 88 99 00", email: "lucas.petit@team.fr",
    rating: 4.79, tasksCompleted: 62, hoursWeek: 35,
    skills: ["Gestion", "Accueil", "Support client"],
    availability: { Lun: "available", Mar: "available", Mer: "available", Jeu: "available", Ven: "off", Sam: "off", Dim: "off" },
  },
];

const SHIFTS: Shift[] = [
  { staffId: "s1", day: "Lun", time: "09:00–12:00", task: "Ménage post-départ", property: "Villa Azur", type: "cleaning" },
  { staffId: "s1", day: "Mer", time: "10:00–13:00", task: "Ménage complet", property: "Penthouse Côte", type: "cleaning" },
  { staffId: "s1", day: "Sam", time: "11:00–14:00", task: "Ménage + inventaire", property: "Apt. Bellevue", type: "cleaning" },
  { staffId: "s2", day: "Lun", time: "14:00–17:00", task: "Révision chaudière", property: "Studio Antibes", type: "maintenance" },
  { staffId: "s2", day: "Mar", time: "09:00–11:00", task: "Inspection générale", property: "Villa Azur", type: "maintenance" },
  { staffId: "s2", day: "Jeu", time: "10:00–12:00", task: "Réparation robinet", property: "Apt. Bellevue", type: "maintenance" },
  { staffId: "s3", day: "Mar", time: "15:00–16:00", task: "Check-in Dupont", property: "Penthouse Côte", type: "checkin" },
  { staffId: "s3", day: "Mer", time: "14:00–16:00", task: "Check-in Kowalski", property: "Villa Azur", type: "checkin" },
  { staffId: "s3", day: "Ven", time: "10:00–13:00", task: "Ménage + check-out", property: "Apt. Bellevue", type: "cleaning" },
  { staffId: "s3", day: "Sam", time: "15:00–16:30", task: "Check-in Beaumont", property: "Apt. Bellevue", type: "checkin" },
  { staffId: "s4", day: "Lun", time: "09:00–17:00", task: "Permanence gestion", property: "Toutes", type: "support" },
  { staffId: "s4", day: "Mar", time: "09:00–17:00", task: "Permanence gestion", property: "Toutes", type: "support" },
  { staffId: "s4", day: "Mer", time: "09:00–17:00", task: "Permanence gestion", property: "Toutes", type: "support" },
  { staffId: "s4", day: "Jeu", time: "09:00–17:00", task: "Permanence gestion", property: "Toutes", type: "support" },
];

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin:    { label: "Administrateur", className: "bg-purple-100 text-purple-700" },
  manager:  { label: "Manager",        className: "bg-blue-100 text-blue-700" },
  owner:    { label: "Propriétaire",   className: "bg-amber-100 text-amber-700" },
  provider: { label: "Prestataire",    className: "bg-green-100 text-green-700" },
};

const SHIFT_COLORS: Record<Shift["type"], { bg: string; text: string }> = {
  cleaning:    { bg: "bg-blue-100",   text: "text-blue-800" },
  maintenance: { bg: "bg-orange-100", text: "text-orange-800" },
  checkin:     { bg: "bg-green-100",  text: "text-green-800" },
  support:     { bg: "bg-purple-100", text: "text-purple-800" },
};

const AVAIL_CONFIG = {
  available: { label: "Dispo",     bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  busy:      { label: "Occupé",    bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  off:       { label: "Congé",     bg: "bg-[#F7F7F7]",  text: "text-[#717171]",  dot: "bg-[#DDDDDD]" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function PerformanceBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F7F7F7] rounded-full overflow-hidden">
        <div className="h-full bg-[#FF5A5F] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[#222222] w-8">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "manager", password: "HostPro2024!" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"members" | "schedule" | "performance">("members");
  const [weekOffset, setWeekOffset] = useState(0);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const toast = useToastStore();

  const MOCK_MEMBERS: Member[] = [
    { id: "m1", user_id: "u1", email: "ahmed@hostpro.fr", full_name: "Ahmed — Démo", role: "admin", is_active: true, joined_at: "2025-01-15", invited_at: null },
    { id: "m2", user_id: "u2", email: "sophie.martin@hostpro.fr", full_name: "Sophie Martin", role: "manager", is_active: true, joined_at: "2025-03-01", invited_at: null },
    { id: "m3", user_id: "u3", email: "lucas.bernard@hostpro.fr", full_name: "Lucas Bernard", role: "viewer", is_active: true, joined_at: "2025-06-10", invited_at: null },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const r = await teamApi.list();
      setMembers(r.data?.length ? r.data : MOCK_MEMBERS);
    } catch {
      setMembers(MOCK_MEMBERS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await teamApi.invite(inviteForm);
      setShowInvite(false);
      setInviteForm({ full_name: "", email: "", role: "manager", password: "HostPro2024!" });
      toast.success("Invitation envoyée", `Un email a été envoyé à ${inviteForm.email}`);
      load();
    } catch {
      // Demo mode — simulate success
      const newMember: Member = {
        id: `m-${Date.now()}`, user_id: `u-${Date.now()}`,
        email: inviteForm.email, full_name: inviteForm.full_name,
        role: inviteForm.role, is_active: false,
        joined_at: null, invited_at: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);
      setShowInvite(false);
      setInviteForm({ full_name: "", email: "", role: "manager", password: "HostPro2024!" });
      toast.success("Invitation envoyée (démo)", `${inviteForm.full_name || inviteForm.email} ajouté en mode démo`);
    }
    setSaving(false);
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setChangingRole(memberId);
    try {
      await teamApi.updateRole(memberId, role);
    } catch {
      // Demo mode — update locally
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m));
      toast.info("Rôle mis à jour (démo)");
    }
    setChangingRole(null);
    load();
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (!confirm(`Retirer ${name || "ce membre"} ?`)) return;
    try {
      await teamApi.remove(memberId);
    } catch {
      // Demo mode — remove locally
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.warning("Membre retiré (démo)");
      return;
    }
    load();
  };

  const initials = (name: string | null, email: string) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : email[0].toUpperCase();

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const activeMembers = members.filter(m => m.is_active);

  const inputClass = "border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full text-sm transition-all";

  // Get today's date window
  const getWeekLabel = () => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7 - TODAY_IDX);
    const end = new Date(base);
    end.setDate(base.getDate() + 6);
    return `${base.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
  };

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 bg-[#F7F7F7] p-1 rounded-xl">
          {([
            { id: "members",     label: "Membres",      icon: <Users size={14} /> },
            { id: "schedule",    label: "Planning",      icon: <Calendar size={14} /> },
            { id: "performance", label: "Performance",   icon: <BarChart2 size={14} /> },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.id ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"
              )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {tab === "members" && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
            <UserPlus size={16} /> Inviter un membre
          </button>
        )}
      </div>

      {/* ── Members tab ── */}
      {tab === "members" && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
              const count = members.filter(m => m.role === role && m.is_active).length;
              return (
                <div key={role} className="bg-white rounded-2xl border border-[#DDDDDD] p-5 shadow-sm">
                  <div className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${cfg.className}`}>{cfg.label}</div>
                  <div className="text-3xl font-bold text-[#222222]">{count}</div>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#717171] uppercase tracking-wide">
                Membres de l'équipe
              </span>
              <span className="text-xs text-[#717171]">{activeMembers.length} actif{activeMembers.length > 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-[#F7F7F7] rounded-xl animate-pulse" />)}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mb-4">
                  <Users size={28} className="text-[#DDDDDD]" />
                </div>
                <h3 className="font-semibold text-[#222222] mb-2">Aucun membre</h3>
                <p className="text-[#717171] text-sm mb-4">Invitez votre équipe pour commencer</p>
                <button onClick={() => setShowInvite(true)}
                  className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                  <UserPlus size={16} /> Inviter
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DDDDDD]">
                {members.map(m => {
                  const roleCfg = ROLE_CONFIG[m.role] || { label: m.role, className: "bg-[#F7F7F7] text-[#717171]" };
                  return (
                    <div key={m.id} className={cn("flex items-center gap-4 px-6 py-4 hover:bg-[#F7F7F7] transition-colors", !m.is_active && "opacity-50")}>
                      <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#FF5A5F] flex-shrink-0">
                        {initials(m.full_name, m.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#222222] truncate">{m.full_name || "—"}</div>
                        <div className="text-sm text-[#717171] truncate">{m.email}</div>
                      </div>
                      <div className="text-xs text-[#717171] hidden md:block w-36 text-right">
                        {m.joined_at ? `Rejoint ${formatDate(m.joined_at)}` : `Invité ${formatDate(m.invited_at)}`}
                      </div>
                      <select value={m.role} disabled={changingRole === m.id}
                        onChange={e => handleRoleChange(m.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer focus:outline-none border-0 ${roleCfg.className}`}>
                        {Object.entries(ROLE_CONFIG).map(([r, c]) => <option key={r} value={r}>{c.label}</option>)}
                      </select>
                      <button onClick={() => handleRemove(m.id, m.full_name || m.email)}
                        className="p-2 text-[#717171] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Schedule tab ── */}
      {tab === "schedule" && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-[#DDDDDD] px-5 py-3">
            <button onClick={() => setWeekOffset(o => o - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <div className="text-center">
              <div className="font-bold text-[#222222]">Semaine du {getWeekLabel()}</div>
              {weekOffset === 0 && <div className="text-xs text-[#FF5A5F] font-semibold">Cette semaine</div>}
            </div>
            <button onClick={() => setWeekOffset(o => o + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Staff schedule grid */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: "700px" }}>
                <thead>
                  <tr className="border-b border-[#DDDDDD]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#717171] uppercase tracking-wide w-40 sticky left-0 bg-white z-10">
                      Personnel
                    </th>
                    {DAYS_WEEK.map((d, i) => (
                      <th key={d} className={cn(
                        "px-2 py-3 text-center text-xs font-bold border-l border-[#F7F7F7]",
                        i === TODAY_IDX + weekOffset * 7 && weekOffset === 0 ? "text-[#FF5A5F] bg-[#FF5A5F]/5" : "text-[#717171]"
                      )}>
                        <div>{d}</div>
                        {i === TODAY_IDX && weekOffset === 0 && <div className="text-[8px] font-black text-[#FF5A5F]">AUJOURD'HUI</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STAFF_MEMBERS.map(staff => {
                    const staffShifts = SHIFTS.filter(s => s.staffId === staff.id);
                    return (
                      <tr key={staff.id} className="border-b border-[#F7F7F7]">
                        <td className="px-4 py-2 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-[#FF5A5F] text-xs font-bold flex-shrink-0">
                              {staff.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#222222]">{staff.name.split(" ")[0]}</div>
                              <div className={cn("text-[9px] font-semibold px-1 py-0.5 rounded", ROLE_CONFIG[staff.role]?.className || "bg-[#F7F7F7] text-[#717171]")}>
                                {ROLE_CONFIG[staff.role]?.label.slice(0, 6) || staff.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        {DAYS_WEEK.map((day, di) => {
                          const dayShifts = staffShifts.filter(s => s.day === day);
                          const avail = staff.availability[day];
                          const ac = AVAIL_CONFIG[avail];
                          return (
                            <td key={day} className={cn(
                              "px-1 py-1.5 align-top border-l border-[#F7F7F7] min-w-[90px]",
                              di === TODAY_IDX && weekOffset === 0 ? "bg-[#FF5A5F]/3" : ""
                            )}>
                              {dayShifts.length > 0 ? (
                                <div className="space-y-1">
                                  {dayShifts.map((sh, i) => {
                                    const sc = SHIFT_COLORS[sh.type];
                                    return (
                                      <div key={i} className={cn("rounded-lg px-1.5 py-1 text-[9px] font-bold", sc.bg, sc.text)}>
                                        <div>{sh.time}</div>
                                        <div className="font-medium opacity-80 truncate">{sh.property === "Toutes" ? sh.task : sh.property}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className={cn("rounded-lg px-1.5 py-1 text-[9px] font-bold text-center", ac.bg, ac.text)}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mb-0.5", ac.dot)} />
                                  {ac.label}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-[#717171] flex-wrap">
            {Object.entries(SHIFT_COLORS).map(([type, c]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className={cn("w-3 h-3 rounded-sm", c.bg)} />
                {type === "cleaning" ? "Ménage" : type === "maintenance" ? "Maintenance" : type === "checkin" ? "Check-in" : "Support"}
              </span>
            ))}
            {Object.entries(AVAIL_CONFIG).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", v.dot)} />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Performance tab ── */}
      {tab === "performance" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Note équipe moy.", value: `${(STAFF_MEMBERS.reduce((s, m) => s + m.rating, 0) / STAFF_MEMBERS.length).toFixed(2)}/5`, icon: <Star size={18} />, color: "text-yellow-500", bg: "bg-yellow-50" },
              { label: "Tâches complétées", value: STAFF_MEMBERS.reduce((s, m) => s + m.tasksCompleted, 0), icon: <CheckCircle size={18} />, color: "text-green-600", bg: "bg-green-50" },
              { label: "Heures / semaine",  value: `${STAFF_MEMBERS.reduce((s, m) => s + m.hoursWeek, 0)}h`, icon: <Clock size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-5 flex items-center gap-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", k.bg, k.color)}>{k.icon}</div>
                <div>
                  <div className="text-2xl font-black text-[#222222]">{k.value}</div>
                  <div className="text-xs text-[#717171]">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Staff cards */}
          <div className="grid grid-cols-2 gap-4">
            {STAFF_MEMBERS.map(staff => {
              const roleCfg = ROLE_CONFIG[staff.role];
              return (
                <div key={staff.id} className="bg-white rounded-2xl border border-[#DDDDDD] p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-[#FF5A5F] text-base font-bold flex-shrink-0 relative">
                      {staff.avatar}
                      {staff.rating >= 4.9 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Award size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#222222]">{staff.name}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", roleCfg?.className || "bg-[#F7F7F7] text-[#717171]")}>
                          {roleCfg?.label || staff.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#717171] mt-0.5">
                        <span className="flex items-center gap-1"><Phone size={10} /> {staff.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-[#F7F7F7] rounded-xl py-2">
                      <div className="text-lg font-black text-[#222222] flex items-center justify-center gap-0.5">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" /> {staff.rating}
                      </div>
                      <div className="text-[10px] text-[#717171]">Note</div>
                    </div>
                    <div className="text-center bg-[#F7F7F7] rounded-xl py-2">
                      <div className="text-lg font-black text-[#222222]">{staff.tasksCompleted}</div>
                      <div className="text-[10px] text-[#717171]">Tâches</div>
                    </div>
                    <div className="text-center bg-[#F7F7F7] rounded-xl py-2">
                      <div className="text-lg font-black text-[#222222]">{staff.hoursWeek}h</div>
                      <div className="text-[10px] text-[#717171]">/ semaine</div>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#717171] font-medium">Performance globale</span>
                      <span className="font-bold text-[#222222]">{((staff.rating / 5) * 100).toFixed(0)}%</span>
                    </div>
                    <PerformanceBar value={staff.rating} />
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {staff.skills.map(s => (
                      <span key={s} className="text-[10px] font-semibold bg-[#FF5A5F]/10 text-[#FF5A5F] px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  {/* Availability this week */}
                  <div className="mt-3 pt-3 border-t border-[#F7F7F7]">
                    <div className="text-[10px] font-bold text-[#717171] mb-1.5 uppercase tracking-wide">Disponibilité</div>
                    <div className="flex gap-1">
                      {DAYS_WEEK.map(d => {
                        const a = staff.availability[d];
                        const ac = AVAIL_CONFIG[a];
                        return (
                          <div key={d} className="flex-1 text-center" title={`${d}: ${ac.label}`}>
                            <div className="text-[8px] text-[#BBBBBB] mb-0.5">{d[0]}</div>
                            <div className={cn("w-full h-4 rounded-sm", ac.bg)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DDDDDD]">
              <div>
                <h2 className="text-lg font-bold text-[#222222]">Inviter un membre</h2>
                <p className="text-sm text-[#717171] mt-0.5">Accès immédiat à la plateforme</p>
              </div>
              <button onClick={() => setShowInvite(false)}
                className="text-[#717171] hover:text-[#222222] transition-colors p-2 rounded-xl hover:bg-[#F7F7F7]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom complet</label>
                <input type="text" required className={inputClass} placeholder="Marie Dubois"
                  value={inviteForm.full_name} onChange={e => setInviteForm({...inviteForm, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Email</label>
                <input type="email" required className={inputClass} placeholder="marie@agence.fr"
                  value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Rôle</label>
                <select className={inputClass} value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                  <option value="admin">Administrateur — accès complet</option>
                  <option value="manager">Manager — gestion quotidienne</option>
                  <option value="owner">Propriétaire — lecture seule</option>
                  <option value="provider">Prestataire — tâches uniquement</option>
                </select>
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Mot de passe provisoire</label>
                <input type="text" className={inputClass} value={inviteForm.password}
                  onChange={e => setInviteForm({...inviteForm, password: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-3 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 text-sm">
                  {saving ? "Invitation..." : "Inviter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

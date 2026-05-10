"use client";
import { useEffect, useState } from "react";
import { teamApi } from "@/lib/api";
import { Users, UserPlus, Trash2, Shield, ChevronDown } from "lucide-react";

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

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur", manager: "Manager", owner: "Propriétaire", provider: "Prestataire",
};
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700", manager: "bg-blue-100 text-blue-700",
  owner: "bg-amber-100 text-amber-700", provider: "bg-green-100 text-green-700",
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "manager", password: "HostPro2024!" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await teamApi.list(); setMembers(r.data); } catch { /**/ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await teamApi.invite(inviteForm);
      setShowInvite(false);
      setInviteForm({ full_name: "", email: "", role: "manager", password: "HostPro2024!" });
      load();
    } catch (err: any) { setError(err.response?.data?.detail || "Erreur lors de l'invitation"); }
    setSaving(false);
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setChangingRole(memberId);
    try { await teamApi.updateRole(memberId, role); load(); } catch { /**/ }
    setChangingRole(null);
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (!confirm(`Retirer ${name || "ce membre"} de l'équipe ?`)) return;
    try { await teamApi.remove(memberId); load(); } catch { /**/ }
  };

  const initials = (name: string | null, email: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : email[0].toUpperCase();

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const activeMembers = members.filter((m) => m.is_active);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Équipe</h1>
          <p className="text-slate-500 text-sm mt-0.5">{activeMembers.length} membre{activeMembers.length > 1 ? "s" : ""} actif{activeMembers.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          <UserPlus size={16} /> Inviter un membre
        </button>
      </div>

      {/* Compteurs par rôle */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = members.filter((m) => m.role === role && m.is_active).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${ROLE_COLORS[role]}`}>
                <Shield size={11} />{label}
              </div>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Liste membres */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Membres de l'équipe</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}</div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun membre encore</p>
            <p className="text-slate-400 text-sm mt-1">Invitez votre équipe pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${!m.is_active ? "opacity-40" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                  {initials(m.full_name, m.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{m.full_name || "—"}</div>
                  <div className="text-sm text-slate-500 truncate">{m.email}</div>
                </div>
                <div className="text-xs text-slate-400 hidden md:block w-36 text-center">
                  {m.joined_at ? `Rejoint ${formatDate(m.joined_at)}` : `Invité ${formatDate(m.invited_at)}`}
                </div>
                <div className="relative">
                  <select value={m.role} disabled={changingRole === m.id}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-full cursor-pointer focus:outline-none ${ROLE_COLORS[m.role] || "bg-slate-100 text-slate-700"}`}>
                    {Object.entries(ROLE_LABELS).map(([r, l]) => <option key={r} value={r}>{l}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
                <button onClick={() => handleRemove(m.id, m.full_name || m.email)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Retirer">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal invitation */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Inviter un membre</h2>
              <p className="text-sm text-slate-500 mt-1">Accès immédiat à la plateforme</p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom complet</label>
                <input type="text" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Marie Dubois" value={inviteForm.full_name} onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="marie@agence.fr" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rôle</label>
                <select className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                  <option value="admin">Administrateur — accès complet</option>
                  <option value="manager">Manager — gestion quotidienne</option>
                  <option value="owner">Propriétaire — lecture seule</option>
                  <option value="provider">Prestataire — tâches uniquement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe provisoire</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
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

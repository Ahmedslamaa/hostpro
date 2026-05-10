"use client";
import { useEffect, useState } from "react";
import { teamApi } from "@/lib/api";
import { Users, UserPlus, Trash2, X } from "lucide-react";

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

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: { label: "Administrateur", className: "bg-purple-100 text-purple-700" },
  manager: { label: "Manager", className: "bg-blue-100 text-blue-700" },
  owner: { label: "Propriétaire", className: "bg-amber-100 text-amber-700" },
  provider: { label: "Prestataire", className: "bg-green-100 text-green-700" },
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    role: "manager",
    password: "HostPro2024!",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await teamApi.list();
      setMembers(r.data);
    } catch {}
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
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'invitation");
    }
    setSaving(false);
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setChangingRole(memberId);
    try {
      await teamApi.updateRole(memberId, role);
      load();
    } catch {}
    setChangingRole(null);
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (!confirm(`Retirer ${name || "ce membre"} de l'équipe ?`)) return;
    try {
      await teamApi.remove(memberId);
      load();
    } catch {}
  };

  const initials = (name: string | null, email: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : email[0].toUpperCase();

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const activeMembers = members.filter((m) => m.is_active);

  const inputClass =
    "border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full text-sm transition-all";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#717171]">
          {activeMembers.length} membre{activeMembers.length !== 1 ? "s" : ""} actif{activeMembers.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <UserPlus size={16} />
          Inviter un membre
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = members.filter((m) => m.role === role && m.is_active).length;
          return (
            <div key={role} className="bg-white rounded-2xl border border-[#DDDDDD] p-5 shadow-sm">
              <div className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${cfg.className}`}>
                {cfg.label}
              </div>
              <div className="text-3xl font-bold text-[#222222]">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Member list */}
      <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7]">
          <span className="text-xs font-semibold text-[#717171] uppercase tracking-wide">
            Membres de l'équipe
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-[#F7F7F7] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-[#DDDDDD]" />
            </div>
            <h3 className="font-semibold text-[#222222] mb-2">Aucun membre</h3>
            <p className="text-[#717171] text-sm mb-4">Invitez votre équipe pour commencer à collaborer</p>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              <UserPlus size={16} /> Inviter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DDDDDD]">
            {members.map((m) => {
              const roleCfg = ROLE_CONFIG[m.role] || { label: m.role, className: "bg-[#F7F7F7] text-[#717171]" };
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#F7F7F7] transition-colors ${
                    !m.is_active ? "opacity-50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#FF5A5F] flex-shrink-0">
                    {initials(m.full_name, m.email)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#222222] truncate">{m.full_name || "—"}</div>
                    <div className="text-sm text-[#717171] truncate">{m.email}</div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-[#717171] hidden md:block w-36 text-right">
                    {m.joined_at
                      ? `Rejoint ${formatDate(m.joined_at)}`
                      : `Invité ${formatDate(m.invited_at)}`}
                  </div>

                  {/* Role selector */}
                  <select
                    value={m.role}
                    disabled={changingRole === m.id}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer focus:outline-none border-0 ${roleCfg.className}`}
                  >
                    {Object.entries(ROLE_CONFIG).map(([r, c]) => (
                      <option key={r} value={r}>{c.label}</option>
                    ))}
                  </select>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(m.id, m.full_name || m.email)}
                    className="p-2 text-[#717171] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Retirer ce membre"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DDDDDD]">
              <div>
                <h2 className="text-lg font-bold text-[#222222]">Inviter un membre</h2>
                <p className="text-sm text-[#717171] mt-0.5">Accès immédiat à la plateforme</p>
              </div>
              <button
                onClick={() => setShowInvite(false)}
                className="text-[#717171] hover:text-[#222222] transition-colors p-2 rounded-xl hover:bg-[#F7F7F7]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom complet</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Marie Dubois"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Email</label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="marie@agence.fr"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Rôle</label>
                <select
                  className={inputClass}
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="admin">Administrateur — accès complet</option>
                  <option value="manager">Manager — gestion quotidienne</option>
                  <option value="owner">Propriétaire — lecture seule</option>
                  <option value="provider">Prestataire — tâches uniquement</option>
                </select>
              </div>

              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Mot de passe provisoire</label>
                <input
                  type="text"
                  className={inputClass}
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-3 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 text-sm"
                >
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

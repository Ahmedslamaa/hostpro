"use client";
import { useEffect, useState } from "react";
import { teamApi } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import { Users, Plus, Mail, ShieldCheck, Eye, Crown, X, AlertCircle } from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  admin:   { label: "Administrateur", className: "bg-primary-500/10 text-primary-600",  icon: Crown },
  manager: { label: "Manager",        className: "bg-blue-100 text-blue-700",        icon: ShieldCheck },
  staff:   { label: "Staff",          className: "bg-amber-100 text-amber-700",      icon: Users },
  viewer:  { label: "Lecteur",        className: "bg-neutral-100 text-neutral-500",     icon: Eye },
};

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
}

function timeSince(iso: string | null) {
  if (!iso) return "Jamais connecté";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30)  return `Il y a ${days} jours`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function TeamPage() {
  const [members, setMembers]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm]           = useState({ email: "", full_name: "", role: "viewer" });
  const [saving, setSaving]       = useState(false);
  const toast = useToastStore();

  const load = () => {
    setLoading(true);
    fetch("/api/v1/team")
      .then(r => r.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamApi.invite(form);
      toast.success("Invitation envoyée", `${form.email} a été ajouté à l'équipe.`);
      setShowInvite(false);
      setForm({ email: "", full_name: "", role: "viewer" });
      load();
    } catch (err: any) {
      toast.error("Erreur", err?.response?.data?.error ?? "Impossible d'inviter ce membre.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-[#717171] focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 w-full transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {loading ? "Chargement…" : `${members.length} membre${members.length !== 1 ? "s" : ""} dans votre espace`}
        </p>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} /> Inviter un membre
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-neutral-900">Inviter un nouveau membre</h2>
            <button onClick={() => setShowInvite(false)} className="text-neutral-500 hover:text-neutral-900">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleInvite} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email *</label>
              <input required type="email" className={inputClass} placeholder="prenom@exemple.fr"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Nom complet</label>
              <input type="text" className={inputClass} placeholder="Prénom Nom"
                value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Rôle</label>
              <select className={inputClass} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Administrateur</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
            <div className="col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowInvite(false)}
                className="px-5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-500 hover:bg-neutral-100 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? "Envoi…" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border border-neutral-200 animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 flex flex-col items-center justify-center py-20 shadow-sm">
          <Users size={40} className="text-[#DDDDDD] mb-4" />
          <p className="font-semibold text-neutral-900 mb-1">Aucun membre d'équipe</p>
          <p className="text-sm text-neutral-500">Invitez des collaborateurs pour gérer vos biens ensemble</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => {
            const roleCfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.viewer;
            const RoleIcon = roleCfg.icon;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-black text-sm">
                    {getInitials(m.full_name, m.email)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 text-sm">{m.full_name ?? m.email}</span>
                    {!m.is_active && (
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Inactif</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Mail size={11} />
                    <span>{m.email}</span>
                  </div>
                </div>

                {/* Role */}
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${roleCfg.className}`}>
                  <RoleIcon size={11} /> {roleCfg.label}
                </span>

                {/* Last login */}
                <div className="text-right text-xs text-neutral-500 flex-shrink-0 w-32">
                  <div className="font-medium text-neutral-900">Dernière connexion</div>
                  <div>{timeSince(m.last_login_at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 flex gap-3">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Rôles :</strong> L'administrateur gère tout · Le manager supervise biens et réservations · Le staff voit les tâches qui lui sont assignées · Le lecteur a accès en consultation uniquement.
        </span>
      </div>
    </div>
  );
}

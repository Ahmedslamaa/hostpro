"use client";
import { useEffect, useState } from "react";
import { teamApi } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import { Users, Plus, Mail, ShieldCheck, Eye, Crown, X, AlertCircle } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

const ROLE_CONFIG: Record<string, { label: string; style: React.CSSProperties; icon: any }> = {
  admin:   { label: "Administrateur", style: { background: "rgba(224,32,96,0.08)", color: "#C00040" },        icon: Crown },
  manager: { label: "Manager",        style: { background: "rgba(59,130,246,0.1)", color: "#1d4ed8" },        icon: ShieldCheck },
  staff:   { label: "Staff",          style: { background: "rgba(192,160,96,0.15)", color: "#C0A060" },       icon: Users },
  viewer:  { label: "Lecteur",        style: { background: "rgba(26,14,18,0.06)", color: INK_SOFT },          icon: Eye },
};

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 10, padding: "12px 14px",
  background: "white", fontFamily: "inherit",
  fontSize: 13, color: INK, outline: "none", width: "100%",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 13, color: INK_SOFT }}>
          {loading ? "Chargement…" : `${members.length} membre${members.length !== 1 ? "s" : ""} dans votre espace`}
        </p>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: INK, color: "#F4F2F0",
            borderRadius: 12, padding: "10px 18px",
            fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
          }}
        >
          <Plus size={15} /> Inviter un membre
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div style={{
          background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
          padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Inviter un nouveau membre</h2>
            <button onClick={() => setShowInvite(false)} style={{ color: INK_SOFT, background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleInvite} className="grid grid-cols-3 gap-4">
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: INK_SOFT, marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Email *</label>
              <input required type="email" style={inputStyle} placeholder="prenom@exemple.fr"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: INK_SOFT, marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Nom complet</label>
              <input type="text" style={inputStyle} placeholder="Prénom Nom"
                value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: INK_SOFT, marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Rôle</label>
              <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Administrateur</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
            <div className="col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowInvite(false)}
                style={{
                  padding: "10px 18px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12,
                  fontSize: 13, color: INK_SOFT, background: "white", cursor: "pointer", fontWeight: 600,
                }}>
                Annuler
              </button>
              <button type="submit" disabled={saving}
                style={{
                  padding: "10px 18px", background: ROSE, color: "white",
                  border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", opacity: saving ? 0.5 : 1,
                }}>
                {saving ? "Envoi…" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse" style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)" }} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div style={{
          background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <Users size={40} style={{ color: "rgba(0,0,0,0.15)", marginBottom: 16 }} />
          <p style={{ fontWeight: 700, color: INK, marginBottom: 4 }}>Aucun membre d'équipe</p>
          <p style={{ fontSize: 13, color: INK_SOFT }}>Invitez des collaborateurs pour gérer vos biens ensemble</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => {
            const roleCfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.viewer;
            const RoleIcon = roleCfg.icon;
            return (
              <div key={m.id} style={{
                background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)",
                padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                {/* Avatar gradient rose */}
                <div style={{
                  width: 48, height: 48,
                  background: "linear-gradient(135deg, rgba(224,32,96,0.15), rgba(224,32,96,0.05))",
                  borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ color: ROSE, fontWeight: 800, fontSize: 14 }}>
                    {getInitials(m.full_name, m.email)}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, color: INK, fontSize: 13 }}>{m.full_name ?? m.email}</span>
                    {!m.is_active && (
                      <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(26,14,18,0.06)", color: INK_SOFT, padding: "3px 7px", borderRadius: 99 }}>Inactif</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 11, color: INK_SOFT }}>
                    <Mail size={10} />
                    <span>{m.email}</span>
                  </div>
                </div>

                {/* Role badge */}
                <span style={{
                  display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800,
                  padding: "5px 12px", borderRadius: 99, flexShrink: 0, letterSpacing: "0.05em",
                  ...roleCfg.style,
                }}>
                  <RoleIcon size={10} /> {roleCfg.label}
                </span>

                {/* Last login */}
                <div style={{ textAlign: "right", fontSize: 11, color: INK_SOFT, flexShrink: 0, width: 120 }}>
                  <div style={{ fontWeight: 700, color: INK, fontSize: 12 }}>Dernière connexion</div>
                  <div>{timeSince(m.last_login_at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div style={{
        background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
        borderRadius: 18, padding: 16, fontSize: 13, color: "#1d4ed8",
        display: "flex", gap: 12,
      }}>
        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          <strong>Rôles :</strong> L'administrateur gère tout · Le manager supervise biens et réservations · Le staff voit les tâches qui lui sont assignées · Le lecteur a accès en consultation uniquement.
        </span>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { calendarApi, messagesApi, profileApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import { Plus, Save, Lock, User, Link, MessageSquare } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
  padding: "12px 14px", background: "white",
  fontFamily: "inherit", fontSize: 13, color: INK, outline: "none", width: "100%",
};

export default function SettingsPage() {
  const { user, setAuth, accessToken, refreshToken, tenantId } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [properties, setProperties] = useState<Property[]>([]);
  const [feedForm, setFeedForm] = useState({
    property_id: "",
    platform: "",
    feed_url: "",
    direction: "import",
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    trigger: "booking_confirmed",
    subject: "",
    body: "",
    channel: "email",
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    phone: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/v1/properties")
      .then(r => r.json())
      .then(d => setProperties(Array.isArray(d) ? d : []))
      .catch(() => setProperties([]));
    messagesApi.listTemplates().then((r) => setTemplates(r.data)).catch(() => {});
    if (user) setProfileForm({ full_name: user.full_name || "", phone: "" });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileSaved(false);
    try {
      const r = await profileApi.update({ full_name: profileForm.full_name });
      if (user && accessToken && refreshToken && tenantId) {
        setAuth({ ...user, full_name: r.data.full_name }, accessToken, refreshToken, tenantId);
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError("Les mots de passe ne correspondent pas");
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwError("8 caractères minimum");
      return;
    }
    setSaving(true);
    try {
      await profileApi.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.response?.data?.detail || "Erreur");
    }
    setSaving(false);
  };

  const addFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    await calendarApi.createFeed(feedForm);
    setFeedForm({ property_id: "", platform: "", feed_url: "", direction: "import" });
    alert("Flux iCal ajouté avec succès");
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await messagesApi.createTemplate(templateForm);
    const r = await messagesApi.listTemplates();
    setTemplates(r.data);
    setTemplateForm({ name: "", trigger: "booking_confirmed", subject: "", body: "", channel: "email" });
    setSaving(false);
  };

  const TRIGGERS = [
    ["booking_confirmed", "Réservation confirmée"],
    ["pre_checkin", "Pré check-in (J-2)"],
    ["checkin_day", "Jour du check-in"],
    ["post_checkout", "Post check-out"],
  ];

  const TABS = [
    { value: "profile", label: "Profil", icon: User },
    { value: "integrations", label: "Intégrations", icon: Link },
    { value: "templates", label: "Modèles messages", icon: MessageSquare },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 w-fit" style={{
        background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 4,
      }}>
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: tab === value ? INK : "transparent",
              color: tab === value ? "#F4F2F0" : INK_SOFT,
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          {/* Avatar placeholder */}
          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 800, color: INK, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Photo de profil</h2>
            <div className="flex items-center gap-5">
              <div style={{
                width: 80, height: 80,
                background: "linear-gradient(135deg, rgba(224,32,96,0.15), rgba(224,32,96,0.05))",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(224,32,96,0.2)",
              }}>
                <span style={{ color: ROSE, fontSize: 28, fontWeight: 800 }}>
                  {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <button style={{
                  border: "1px solid rgba(0,0,0,0.1)", color: INK, fontWeight: 600,
                  padding: "8px 16px", borderRadius: 10, background: "white", cursor: "pointer", fontSize: 13,
                }}>
                  Changer la photo
                </button>
                <p style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>JPG, PNG ou GIF. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 36, height: 36, background: "rgba(224,32,96,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={15} style={{ color: ROSE }} />
              </div>
              <h2 style={{ fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Informations personnelles</h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              {profileSaved && (
                <div style={{ background: "rgba(27,122,74,0.08)", border: "1px solid rgba(27,122,74,0.2)", color: "#1B7A4A", borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>
                  Profil mis à jour avec succès
                </div>
              )}
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Nom complet</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Email</label>
                <input
                  type="email"
                  disabled
                  style={{ ...inputStyle, color: INK_SOFT, background: PAPER, cursor: "not-allowed" }}
                  value={user?.email || ""}
                />
                <p style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>L'email ne peut pas être modifié pour des raisons de sécurité</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: ROSE, color: "white", fontWeight: 700,
                  padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontSize: 13, opacity: saving ? 0.6 : 1,
                }}
              >
                <Save size={14} />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </form>
          </div>

          {/* Password form */}
          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 36, height: 36, background: "rgba(224,32,96,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={15} style={{ color: ROSE }} />
              </div>
              <h2 style={{ fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Changer le mot de passe</h2>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              {pwError && (
                <div style={{ background: "rgba(192,0,64,0.06)", border: "1px solid rgba(192,0,64,0.2)", color: "#C00040", borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>{pwError}</div>
              )}
              {pwSuccess && (
                <div style={{ background: "rgba(27,122,74,0.08)", border: "1px solid rgba(27,122,74,0.2)", color: "#1B7A4A", borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>
                  Mot de passe modifié avec succès
                </div>
              )}
              {["Mot de passe actuel", "Nouveau mot de passe", "Confirmer"].map((label, i) => {
                const keys = ["current_password", "new_password", "confirm"] as const;
                return (
                  <div key={i}>
                    <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>{label}</label>
                    <input
                      type="password"
                      required
                      minLength={i === 1 ? 8 : undefined}
                      placeholder={i === 1 ? "8 caractères minimum" : undefined}
                      style={inputStyle}
                      value={pwForm[keys[i]]}
                      onChange={(e) => setPwForm({ ...pwForm, [keys[i]]: e.target.value })}
                    />
                  </div>
                );
              })}
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: INK, color: "#F4F2F0", fontWeight: 700,
                  padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontSize: 13, opacity: saving ? 0.6 : 1,
                }}
              >
                <Lock size={14} />
                {saving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Integrations tab */}
      {tab === "integrations" && (
        <div className="max-w-2xl space-y-6">
          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 800, color: INK, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Ajouter un flux iCal</h2>
            <p style={{ fontSize: 13, color: INK_SOFT, marginBottom: 20 }}>
              Synchronisez vos calendriers Airbnb, Booking.com et Abritel via iCal.
            </p>
            <form onSubmit={addFeed} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Propriété</label>
                  <select required style={inputStyle} value={feedForm.property_id} onChange={(e) => setFeedForm({ ...feedForm, property_id: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Plateforme</label>
                  <select style={inputStyle} value={feedForm.platform} onChange={(e) => setFeedForm({ ...feedForm, platform: e.target.value })}>
                    <option value="">Autre</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="abritel">Abritel</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>URL iCal</label>
                <input
                  required type="url" style={inputStyle}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  value={feedForm.feed_url}
                  onChange={(e) => setFeedForm({ ...feedForm, feed_url: e.target.value })}
                />
              </div>
              <button
                type="submit"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: ROSE, color: "white", fontWeight: 700,
                  padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13,
                }}
              >
                <Plus size={14} /> Ajouter le flux
              </button>
            </form>
          </div>

          <div style={{
            background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 18, padding: 20,
          }}>
            <h3 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 8 }}>API natives OTA — disponibles en V1.5</h3>
            <p style={{ fontSize: 13, color: "#1d4ed8" }}>
              Connexions directes Airbnb, Booking.com et Abritel planifiées pour la V1.5. En attendant,
              utilisez la synchronisation iCal (mise à jour toutes les heures).
            </p>
          </div>
        </div>
      )}

      {/* Templates tab */}
      {tab === "templates" && (
        <div className="max-w-2xl space-y-6">
          {templates.length > 0 && (
            <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: PAPER }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: INK_SOFT, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Modèles existants</span>
              </div>
              <div>
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: INK, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 2 }}>{t.trigger} · {t.channel}</div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                      padding: "4px 8px", borderRadius: 99,
                      ...(t.is_active
                        ? { background: "rgba(27,122,74,0.1)", color: "#1B7A4A" }
                        : { background: "rgba(26,14,18,0.06)", color: INK_SOFT }),
                    }}>
                      {t.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 800, color: INK, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Nouveau modèle de message</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Nom</label>
                  <input
                    required style={inputStyle}
                    placeholder="Confirmation de réservation"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Déclencheur</label>
                  <select style={inputStyle} value={templateForm.trigger} onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value })}>
                    {TRIGGERS.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Sujet</label>
                <input
                  style={inputStyle}
                  placeholder="Votre réservation est confirmée !"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label style={{ color: INK, fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Corps du message</label>
                <p style={{ fontSize: 11, color: INK_SOFT, marginBottom: 8 }}>
                  Variables disponibles : {`{{guest_name}}`}, {`{{property_name}}`}, {`{{check_in}}`}, {`{{check_out}}`}
                </p>
                <textarea
                  rows={5}
                  required
                  style={{ ...inputStyle, resize: "none" }}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: ROSE, color: "white", fontWeight: 700,
                  padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontSize: 13, opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Enregistrement..." : "Créer le modèle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

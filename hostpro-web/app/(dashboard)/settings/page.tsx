"use client";
import { useState, useEffect } from "react";
import { calendarApi, messagesApi, profileApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import { Plus, Save, Lock, User, Link, MessageSquare } from "lucide-react";

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

  const inputClass =
    "border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 w-full text-sm transition-all";

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-[#DDDDDD] rounded-xl p-1 w-fit">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === value
                ? "bg-[#222222] text-white"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          {/* Avatar placeholder */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="font-bold text-[#222222] mb-5">Photo de profil</h2>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center border-2 border-[#FF5A5F]/20">
                <span className="text-[#FF5A5F] text-2xl font-bold">
                  {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <button className="border border-[#DDDDDD] text-[#222222] font-semibold px-4 py-2 rounded-xl hover:bg-[#F7F7F7] transition-all text-sm">
                  Changer la photo
                </button>
                <p className="text-xs text-[#717171] mt-1.5">JPG, PNG ou GIF. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
                <User size={16} className="text-[#FF5A5F]" />
              </div>
              <h2 className="font-bold text-[#222222]">Informations personnelles</h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              {profileSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  Profil mis à jour avec succès
                </div>
              )}
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom complet</label>
                <input
                  type="text"
                  className={inputClass}
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Email</label>
                <input
                  type="email"
                  disabled
                  className="border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#717171] bg-[#F7F7F7] w-full text-sm cursor-not-allowed"
                  value={user?.email || ""}
                />
                <p className="text-xs text-[#717171] mt-1.5">L'email ne peut pas être modifié pour des raisons de sécurité</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                <Save size={15} />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </form>
          </div>

          {/* Password form */}
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center">
                <Lock size={16} className="text-[#FF5A5F]" />
              </div>
              <h2 className="font-bold text-[#222222]">Changer le mot de passe</h2>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{pwError}</div>
              )}
              {pwSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  Mot de passe modifié avec succès
                </div>
              )}
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  className={inputClass}
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
                  className={inputClass}
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Confirmer</label>
                <input
                  type="password"
                  required
                  className={inputClass}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#222222] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                <Lock size={15} />
                {saving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Integrations tab */}
      {tab === "integrations" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="font-bold text-[#222222] mb-2">Ajouter un flux iCal</h2>
            <p className="text-sm text-[#717171] mb-5">
              Synchronisez vos calendriers Airbnb, Booking.com et Abritel via iCal.
            </p>
            <form onSubmit={addFeed} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#222222] text-sm font-semibold mb-2 block">Propriété</label>
                  <select
                    required
                    className={inputClass}
                    value={feedForm.property_id}
                    onChange={(e) => setFeedForm({ ...feedForm, property_id: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#222222] text-sm font-semibold mb-2 block">Plateforme</label>
                  <select
                    className={inputClass}
                    value={feedForm.platform}
                    onChange={(e) => setFeedForm({ ...feedForm, platform: e.target.value })}
                  >
                    <option value="">Autre</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="abritel">Abritel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">URL iCal</label>
                <input
                  required
                  type="url"
                  className={inputClass}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  value={feedForm.feed_url}
                  onChange={(e) => setFeedForm({ ...feedForm, feed_url: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Plus size={15} /> Ajouter le flux
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">API natives OTA — disponibles en V1.5</h3>
            <p className="text-sm text-blue-700">
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
            <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7]">
                <span className="text-xs font-semibold text-[#717171] uppercase tracking-wide">Modèles existants</span>
              </div>
              <div className="divide-y divide-[#DDDDDD]">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#F7F7F7] transition-colors">
                    <div>
                      <div className="font-semibold text-[#222222]">{t.name}</div>
                      <div className="text-xs text-[#717171] mt-0.5">{t.trigger} · {t.channel}</div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        t.is_active ? "bg-green-100 text-green-700" : "bg-[#F7F7F7] text-[#717171]"
                      }`}
                    >
                      {t.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="font-bold text-[#222222] mb-5">Nouveau modèle de message</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#222222] text-sm font-semibold mb-2 block">Nom</label>
                  <input
                    required
                    className={inputClass}
                    placeholder="Confirmation de réservation"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[#222222] text-sm font-semibold mb-2 block">Déclencheur</label>
                  <select
                    className={inputClass}
                    value={templateForm.trigger}
                    onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value })}
                  >
                    {TRIGGERS.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Sujet</label>
                <input
                  className={inputClass}
                  placeholder="Votre réservation est confirmée !"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[#222222] text-sm font-semibold mb-2 block">Corps du message</label>
                <p className="text-xs text-[#717171] mb-2">
                  Variables disponibles : {`{{guest_name}}`}, {`{{property_name}}`}, {`{{check_in}}`}, {`{{check_out}}`}
                </p>
                <textarea
                  rows={5}
                  required
                  className={inputClass + " resize-none"}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
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

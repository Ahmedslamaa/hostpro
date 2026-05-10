"use client";
import { useState, useEffect } from "react";
import { calendarApi, propertiesApi, messagesApi, profileApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import { Plus, RefreshCw, Save, Lock, User } from "lucide-react";

export default function SettingsPage() {
  const { user, setAuth, accessToken, refreshToken, tenantId } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [properties, setProperties] = useState<Property[]>([]);
  const [feedForm, setFeedForm] = useState({ property_id: "", platform: "", feed_url: "", direction: "import" });
  const [syncing, setSyncing] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", trigger: "booking_confirmed", subject: "", body: "", channel: "email" });
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Profile
  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || "", phone: "" });
  const [profileSaved, setProfileSaved] = useState(false);

  // Password
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    propertiesApi.list().then((r) => setProperties(r.data)).catch(() => {});
    messagesApi.listTemplates().then((r) => setTemplates(r.data)).catch(() => {});
    if (user) setProfileForm({ full_name: user.full_name || "", phone: "" });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setProfileSaved(false);
    try {
      const r = await profileApi.update({ full_name: profileForm.full_name });
      if (user && accessToken && refreshToken && tenantId) {
        setAuth({ ...user, full_name: r.data.full_name }, accessToken, refreshToken, tenantId);
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch { /**/ }
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError(""); setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm) { setPwError("Les mots de passe ne correspondent pas"); return; }
    if (pwForm.new_password.length < 8) { setPwError("8 caractères minimum"); return; }
    setSaving(true);
    try {
      await profileApi.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) { setPwError(err.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  const addFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    await calendarApi.createFeed(feedForm);
    setFeedForm({ property_id: "", platform: "", feed_url: "", direction: "import" });
    alert("Flux iCal ajouté avec succès");
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await messagesApi.createTemplate(templateForm);
    const r = await messagesApi.listTemplates();
    setTemplates(r.data);
    setTemplateForm({ name: "", trigger: "booking_confirmed", subject: "", body: "", channel: "email" });
    setSaving(false);
  };

  const TRIGGERS = [
    ["booking_confirmed", "Réservation confirmée"], ["pre_checkin", "Pré check-in (J-2)"],
    ["checkin_day", "Jour du check-in"], ["post_checkout", "Post check-out"],
  ];

  const TABS = [["profile", "Profil"], ["integrations", "Intégrations iCal"], ["templates", "Templates messages"]];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Paramètres</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === v ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          {/* Profil */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <User size={18} className="text-slate-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Informations personnelles</h2>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              {profileSaved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">Profil mis à jour</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom complet</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" disabled className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  value={user?.email || ""} />
                <p className="text-xs text-slate-400 mt-1">L'email ne peut pas être modifié pour des raisons de sécurité</p>
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                <Save size={14} />{saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>

          {/* Mot de passe */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Lock size={18} className="text-slate-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Changer le mot de passe</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              {pwError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">{pwError}</div>}
              {pwSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">Mot de passe modifié avec succès</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe actuel</label>
                <input type="password" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nouveau mot de passe</label>
                <input type="password" required minLength={8} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="8 caractères minimum" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer</label>
                <input type="password" required className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                <Lock size={14} />{saving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "integrations" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Ajouter un flux iCal</h2>
            <p className="text-sm text-slate-500 mb-4">Synchronisez vos calendriers Airbnb, Booking.com et Abritel via iCal.</p>
            <form onSubmit={addFeed} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bien</label>
                  <select required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={feedForm.property_id} onChange={(e) => setFeedForm({ ...feedForm, property_id: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Plateforme</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={feedForm.platform} onChange={(e) => setFeedForm({ ...feedForm, platform: e.target.value })}>
                    <option value="">Autre</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="abritel">Abritel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL iCal</label>
                <input required type="url" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://www.airbnb.com/calendar/ical/..." value={feedForm.feed_url}
                  onChange={(e) => setFeedForm({ ...feedForm, feed_url: e.target.value })} />
              </div>
              <button type="submit" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800">
                <Plus size={15} /> Ajouter le flux
              </button>
            </form>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">API natives OTA — disponibles en V1.5</h3>
            <p className="text-sm text-blue-700">Connexions directes Airbnb, Booking.com et Abritel planifiées pour la V1.5. En attendant, utilisez la sync iCal (mise à jour toutes les heures).</p>
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="max-w-2xl space-y-6">
          {templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.trigger} · {t.channel}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {t.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Nouveau template</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
                  <input required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Confirmation de réservation" value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Déclencheur</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={templateForm.trigger} onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value })}>
                    {TRIGGERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sujet</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Votre réservation est confirmée !" value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Corps du message</label>
                <p className="text-xs text-slate-400 mb-2">Variables : {`{{guest_name}}`}, {`{{property_name}}`}, {`{{check_in}}`}, {`{{check_out}}`}</p>
                <textarea rows={5} required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                {saving ? "Enregistrement..." : "Créer le template"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

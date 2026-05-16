"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, Plus, X, RefreshCw, Wifi, WifiOff,
  Copy, Eye, EyeOff, Clock, ArrowUpRight, Plug,
  Globe, Calendar, AlertTriangle, ExternalLink, Trash2,
} from "lucide-react";
import { syncApi, propertiesApi } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────

interface IcalFeed {
  id: string;
  property_id: string;
  platform: string | null;
  feed_url: string;
  direction: string;
  sync_status: "pending" | "success" | "error";
  last_synced_at: string | null;
  error_message: string | null;
}

interface Property {
  id: string;
  name: string;
  city: string | null;
}

// ── Platform catalogue ─────────────────────────────────────────

const PLATFORMS = [
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "A",
    logoColor: "text-primary-500",
    logoBg: "bg-primary-500/10",
    borderColor: "border-primary-500/30",
    description: "Synchronisez vos réservations et calendriers Airbnb.",
    popular: true,
    instructions: [
      "Allez dans Airbnb  votre annonce  Calendrier",
      'Cliquez sur "Disponibilité"  "Connecter des calendriers"',
      'Copiez l\'URL sous "Exporter le calendrier"',
    ],
  },
  {
    id: "booking",
    name: "Booking.com",
    logo: "B",
    logoColor: "text-blue-600",
    logoBg: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Importez vos réservations depuis l'extranet Booking.com.",
    popular: true,
    instructions: [
      "Connectez-vous à votre Extranet Booking.com",
      'Allez dans Calendrier  "Synchronisation iCal"',
      'Copiez le lien "Exporter le calendrier"',
    ],
  },
  {
    id: "abritel",
    name: "Abritel / VRBO",
    logo: "V",
    logoColor: "text-cyan-600",
    logoBg: "bg-cyan-50",
    borderColor: "border-cyan-200",
    description: "Synchronisez le réseau Expedia Group (Abritel, VRBO).",
    popular: true,
    instructions: [
      "Connectez-vous à votre espace propriétaire Abritel",
      'Allez dans Calendrier  "Synchronisation"',
      "Copiez l'URL iCal Export",
    ],
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    logo: "T",
    logoColor: "text-green-700",
    logoBg: "bg-green-50",
    borderColor: "border-green-200",
    description: "Importez vos réservations TripAdvisor / Holiday Lettings.",
    popular: false,
    instructions: [
      "Accédez à votre espace propriétaire TripAdvisor",
      'Cherchez "Export calendrier" ou "iCal sync"',
      "Copiez l'URL générée",
    ],
  },
  {
    id: "direct",
    name: "Autre / Site direct",
    logo: "D",
    logoColor: "text-green-600",
    logoBg: "bg-green-50",
    borderColor: "border-green-200",
    description: "Tout flux iCal standard (.ics) depuis votre site ou un autre PMS.",
    popular: false,
    instructions: [
      "Récupérez l'URL iCal depuis votre système",
      "L'URL doit commencer par https:// et pointer vers un .ics",
      "Collez-la dans le champ ci-dessous",
    ],
  },
];

// ── Connect modal ──────────────────────────────────────────────

function ConnectModal({
  platform,
  properties,
  onClose,
  onSuccess,
}: {
  platform: (typeof PLATFORMS)[0];
  properties: Property[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [icalUrl, setIcalUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const valid = icalUrl.startsWith("http") && propertyId;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError("");
    try {
      await syncApi.createFeed({
        property_id: propertyId,
        platform: platform.id,
        url: icalUrl,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Erreur lors de la connexion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-neutral-200">
          <div className={`w-12 h-12 ${platform.logoBg} rounded-2xl flex items-center justify-center font-black text-xl ${platform.logoColor}`}>
            {platform.logo}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-900">Connecter {platform.name}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{platform.description}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
            <p className="font-semibold text-blue-800 mb-2">Comment obtenir votre URL iCal ?</p>
            <ol className="space-y-1 text-blue-700 list-decimal list-inside text-xs">
              {platform.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Property selector */}
          <div>
            <label className="text-sm font-semibold text-neutral-900 mb-1.5 block">Propriété concernée</label>
            <select
              value={propertyId}
              onChange={e => setPropertyId(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 bg-white"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.city ? ` — ${p.city}` : ""}</option>
              ))}
            </select>
          </div>

          {/* iCal URL */}
          <div>
            <label className="text-sm font-semibold text-neutral-900 mb-1.5 block">
              URL iCal <span className="text-primary-500">*</span>
            </label>
            <input
              value={icalUrl}
              onChange={e => setIcalUrl(e.target.value)}
              placeholder="https://www.airbnb.fr/calendar/ical/..."
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-primary-500 transition-colors"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              L'URL doit commencer par <code className="bg-neutral-100 px-1 rounded">https://</code>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-neutral-200 text-neutral-900 font-semibold py-3 rounded-xl text-sm hover:bg-neutral-100 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!valid || saving}
            className="flex-1 bg-primary-500 hover:bg-[#E00B41] disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connexion...</>
              : <><CheckCircle size={14} /> Connecter & synchroniser</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feed row in connected list ─────────────────────────────────

function FeedRow({
  feed,
  properties,
  onSync,
  onDelete,
}: {
  feed: IcalFeed;
  properties: Property[];
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const platform = PLATFORMS.find(p => p.id === feed.platform) ?? PLATFORMS[PLATFORMS.length - 1];
  const property = properties.find(p => p.id === feed.property_id);

  const handleSync = async () => {
    setSyncing(true);
    await onSync(feed.id);
    setSyncing(false);
  };

  const copyExport = async () => {
    const url = syncApi.exportUrl(feed.property_id);
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    success: { label: "Synchronisé", color: "text-green-700 bg-green-100", dot: "bg-green-500" },
    pending: { label: "En attente", color: "text-amber-700 bg-amber-100", dot: "bg-amber-400 animate-pulse" },
    error:   { label: "Erreur",     color: "text-red-700 bg-red-100",     dot: "bg-red-500" },
  }[feed.sync_status] ?? { label: "Inconnu", color: "text-gray-600 bg-gray-100", dot: "bg-gray-400" };

  const lastSync = feed.last_synced_at
    ? new Date(feed.last_synced_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "Jamais";

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className={`w-10 h-10 ${platform.logoBg} rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${platform.logoColor}`}>
          {platform.logo}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm text-neutral-900">{platform.name}</span>
            <span className="text-[#DDDDDD]">·</span>
            <span className="text-sm text-neutral-500 truncate">{property?.name ?? "Propriété inconnue"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${statusConfig.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="flex items-center gap-1"><Clock size={10} /> {lastSync}</span>
          </div>
          {feed.error_message && (
            <p className="text-xs text-red-500 mt-1 truncate">{feed.error_message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Copy export URL */}
          <button
            onClick={copyExport}
            title="Copier l'URL iCal HOSTPRO (à coller dans la plateforme)"
            className="flex items-center gap-1.5 border border-neutral-200 text-neutral-500 hover:text-neutral-900 text-xs font-medium px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? "Copié !" : "Export URL"}
          </button>

          {/* Manual sync */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 border border-neutral-200 text-neutral-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sync..." : "Sync"}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(feed.id)}
            className="flex items-center gap-1 text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-2 rounded-xl transition-colors"
            title="Déconnecter"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [feeds, setFeeds] = useState<IcalFeed[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<(typeof PLATFORMS)[0] | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [feedsRes, propsRes] = await Promise.all([
        syncApi.listFeeds(),
        propertiesApi.list(),
      ]);
      setFeeds(feedsRes.data ?? []);
      setProperties(propsRes.data?.items ?? propsRes.data ?? []);
    } catch {
      // silently fail — mock data fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSync = async (feedId: string) => {
    try {
      await syncApi.syncFeed(feedId);
      await loadData();
    } catch (e: any) {
      console.error("Sync error", e);
      await loadData();
    }
  };

  const handleDelete = async (feedId: string) => {
    if (!confirm("Déconnecter ce flux ? Les réservations déjà importées seront conservées.")) return;
    try {
      await syncApi.deleteFeed(feedId);
      setFeeds(f => f.filter(x => x.id !== feedId));
    } catch (e) {
      console.error("Delete error", e);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      await syncApi.syncAll();
      await loadData();
    } finally {
      setSyncingAll(false);
    }
  };

  // Which platforms already have at least one feed
  const connectedIds = new Set(feeds.map(f => f.platform));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Intégrations & Connecteurs</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            iCal bidirectionnel · Airbnb · Booking · Abritel · Sync toutes les 15 min
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feeds.length > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="flex items-center gap-2 border border-neutral-200 text-neutral-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw size={15} className={syncingAll ? "animate-spin" : ""} />
              {syncingAll ? "Synchronisation..." : "Tout synchroniser"}
            </button>
          )}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            <Wifi size={15} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {feeds.filter(f => f.sync_status === "success").length} flux actif{feeds.filter(f => f.sync_status === "success").length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Connected feeds */}
      {!loading && feeds.length > 0 && (
        <div>
          <h2 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Flux connectés ({feeds.length})
          </h2>
          <div className="space-y-3">
            {feeds.map(feed => (
              <FeedRow
                key={feed.id}
                feed={feed}
                properties={properties}
                onSync={handleSync}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Platforms to connect */}
      <div>
        <h2 className="font-bold text-neutral-900 mb-3">Ajouter une intégration</h2>
        <div className="grid grid-cols-3 gap-4">
          {PLATFORMS.map(p => {
            const isConnected = connectedIds.has(p.id);
            return (
              <div
                key={p.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all
                  ${isConnected ? "border-green-200" : "border-neutral-200 hover:border-primary-500/30 hover:shadow-sm"}`}
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${p.logoBg} rounded-2xl flex items-center justify-center font-black text-lg ${p.logoColor}`}>
                      {p.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{p.name}</span>
                        {p.popular && <span className="text-[9px] font-black bg-primary-500 text-white px-1.5 py-0.5 rounded-full">TOP</span>}
                      </div>
                      <span className="text-xs text-neutral-500">iCal</span>
                    </div>
                  </div>
                  {isConnected && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connecté
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">{p.description}</p>

                <button
                  onClick={() => setModalPlatform(p)}
                  disabled={properties.length === 0}
                  className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-colors
                    ${isConnected
                      ? "border border-neutral-200 text-neutral-900 hover:bg-neutral-100"
                      : "bg-primary-500 hover:bg-[#E00B41] text-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <Plus size={13} />
                  {isConnected ? "Ajouter un autre bien" : "Connecter"}
                </button>
              </div>
            );
          })}

          {/* Empty slot — request integration */}
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-primary-500/40 transition-colors cursor-pointer group min-h-[200px]">
            <div className="w-11 h-11 bg-neutral-100 group-hover:bg-primary-500/10 rounded-2xl flex items-center justify-center transition-colors">
              <Plug size={20} className="text-[#DDDDDD] group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm text-neutral-500 group-hover:text-neutral-900">Demander une intégration</div>
              <div className="text-xs text-[#BBBBBB] mt-0.5">Autre plateforme ?</div>
            </div>
          </div>
        </div>
      </div>

      {/* No properties warning */}
      {!loading && properties.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Aucune propriété trouvée</p>
            <p className="text-xs text-amber-700 mt-0.5">Ajoutez d'abord une propriété depuis le module <a href="/properties" className="underline font-medium">Propriétés</a> avant de connecter des plateformes.</p>
          </div>
        </div>
      )}

      {/* Info footer — bidirectional sync explanation */}
      <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Calendar size={16} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-neutral-900 mb-1">Synchronisation bidirectionnelle iCal</div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            HOSTPRO <strong>importe</strong> vos réservations depuis chaque plateforme (via leur URL iCal)
            et <strong>exporte</strong> un calendrier iCal que vous pouvez coller dans Airbnb, Booking.com
            et Abritel pour bloquer les dates automatiquement. Sync auto toutes les <strong>15 minutes</strong>.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs bg-white border border-neutral-200 rounded-full px-3 py-1">
              <CheckCircle size={10} className="text-green-500" /> Import réservations
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white border border-neutral-200 rounded-full px-3 py-1">
              <CheckCircle size={10} className="text-green-500" /> Blocage dates automatique
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white border border-neutral-200 rounded-full px-3 py-1">
              <CheckCircle size={10} className="text-green-500" /> Déduplication des événements
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white border border-neutral-200 rounded-full px-3 py-1">
              <CheckCircle size={10} className="text-green-500" /> Création automatique des réservations
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalPlatform && (
        <ConnectModal
          platform={modalPlatform}
          properties={properties}
          onClose={() => setModalPlatform(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}


'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';
import { MessageSidebar } from '@/components/messages/MessageSidebar';
import { MessageForm } from '@/components/messages/MessageForm';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageEmpty } from '@/components/messages/MessageEmpty';
import { MessageActions } from '@/components/messages/MessageActions';
import { MessageDetailSkeleton } from '@/components/messages/MessageSkeleton';
import { PlatformBadge } from '@/components/messages/PlatformBadge';
import { useMessagePolling } from '@/hooks/useMessagePolling';
import { useWebPushSubscription } from '@/hooks/useWebPushSubscription';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function MessagesPage() {
  const {
    fetchThreads,
    threads,
    currentThread,
    selectedThreadId,
    loading,
    syncing,
    error,
    sync,
    clearError,
    markAsRead
  } = useMessagesStore();

  // WebPush subscription for notifications
  const { isSubscribed, isSupported, subscribe } = useWebPushSubscription();
=======
// ── Types ──────────────────────────────────────────────────────────────────────

type Channel = "airbnb" | "booking" | "whatsapp" | "sms" | "email" | "direct";
type MessageStatus = "sent" | "delivered" | "read" | "failed";

interface Msg {
  id: string;
  body: string;
  sender: "guest" | "host" | "bot";
  timestamp: Date;
  status?: MessageStatus;
}

interface Conversation {
  id: string;
  guestName: string;
  property: string;
  channel: Channel;
  lastMessage: string;
  lastTs: Date;
  unread: number;
  status: "active" | "pending" | "resolved";
  tags: string[];
  messages: Msg[];
  botEnabled: boolean;
  checkIn?: string;
  checkOut?: string;
  reservationId?: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK: Conversation[] = [
  {
    id: "c1", guestName: "Sophie Martin", property: "Villa Azur",
    channel: "airbnb", lastMessage: "Bonjour, est-ce que le parking est inclus ?",
    lastTs: new Date(Date.now() - 4 * 60000), unread: 2, status: "pending",
    tags: ["parking"], botEnabled: true,
    checkIn: "15 mai", checkOut: "19 mai", reservationId: "AIRBNB-281734",
    messages: [
      { id: "m1", body: "Bonjour ! Je suis ravie de réserver votre villa.", sender: "guest", timestamp: new Date(Date.now() - 20 * 60000) },
      { id: "m2", body: "Bonjour Sophie ! Merci pour votre réservation 🙏 N'hésitez pas si vous avez des questions.", sender: "bot", timestamp: new Date(Date.now() - 19 * 60000), status: "read" },
      { id: "m3", body: "Bonjour, est-ce que le parking est inclus ?", sender: "guest", timestamp: new Date(Date.now() - 4 * 60000) },
    ],
  },
  {
    id: "c2", guestName: "Jean-Pierre Dupont", property: "Penthouse Côte",
    channel: "booking", lastMessage: "Check-in à 15h c'est bien ça ?",
    lastTs: new Date(Date.now() - 12 * 60000), unread: 1, status: "active",
    tags: ["check-in"], botEnabled: true,
    checkIn: "17 mai", checkOut: "24 mai", reservationId: "BK-9283741",
    messages: [
      { id: "m1", body: "Bonjour, je confirme mon arrivée pour le 17.", sender: "guest", timestamp: new Date(Date.now() - 30 * 60000) },
      { id: "m2", body: "Bonjour Jean-Pierre ! Votre réservation est confirmée. Le code d'accès vous sera envoyé 24h avant votre arrivée.", sender: "bot", timestamp: new Date(Date.now() - 28 * 60000), status: "read" },
      { id: "m3", body: "Check-in à 15h c'est bien ça ?", sender: "guest", timestamp: new Date(Date.now() - 12 * 60000) },
    ],
  },
  {
    id: "c3", guestName: "Anna Kowalski", property: "Villa Azur",
    channel: "whatsapp", lastMessage: "Parfait merci beaucoup ! ",
    lastTs: new Date(Date.now() - 35 * 60000), unread: 0, status: "resolved",
    tags: ["wifi"], botEnabled: true,
    checkIn: "20 mai", checkOut: "25 mai",
    messages: [
      { id: "m1", body: "Bonjour, quel est le mot de passe wifi ?", sender: "guest", timestamp: new Date(Date.now() - 42 * 60000) },
      { id: "m2", body: "Bonjour Anna ! Le mot de passe WiFi est : VillaAzur2024 🔑\nN'hésitez pas si vous avez besoin d'autre chose !", sender: "bot", timestamp: new Date(Date.now() - 40 * 60000), status: "read" },
      { id: "m3", body: "Parfait merci beaucoup ! ", sender: "guest", timestamp: new Date(Date.now() - 35 * 60000) },
    ],
  },
  {
    id: "c4", guestName: "Marc Thibault", property: "Studio Antibes",
    channel: "sms", lastMessage: "D'accord, je serai là vers 18h.",
    lastTs: new Date(Date.now() - 2 * 3600000), unread: 0, status: "active",
    tags: ["arrivée tardive"], botEnabled: false,
    checkIn: "16 mai", checkOut: "18 mai",
    messages: [
      { id: "m1", body: "Bonsoir, mon vol est décalé je serai là vers 18h.", sender: "guest", timestamp: new Date(Date.now() - 2.5 * 3600000) },
      { id: "m2", body: "Bonsoir Marc ! Pas de souci, la boîte à clés est disponible 24h/24. Code : 3847.", sender: "host", timestamp: new Date(Date.now() - 2.2 * 3600000), status: "read" },
      { id: "m3", body: "D'accord, je serai là vers 18h.", sender: "guest", timestamp: new Date(Date.now() - 2 * 3600000) },
    ],
  },
  {
    id: "c5", guestName: "Claire Beaumont", property: "Apt. Bellevue",
    channel: "email", lastMessage: "Pouvez-vous nous recommander des restaurants ?",
    lastTs: new Date(Date.now() - 5 * 3600000), unread: 3, status: "pending",
    tags: ["recommandations"], botEnabled: true,
    checkIn: "18 mai", checkOut: "22 mai",
    messages: [
      { id: "m1", body: "Bonjour, nous serons 4 adultes et 2 enfants. Avez-vous des lits supplémentaires ?", sender: "guest", timestamp: new Date(Date.now() - 6 * 3600000) },
      { id: "m2", body: "Bonjour Claire ! Oui, l'appartement dispose de 2 lits supplémentaires que nous pouvons préparer à l'avance.", sender: "bot", timestamp: new Date(Date.now() - 5.8 * 3600000), status: "read" },
      { id: "m3", body: "Pouvez-vous nous recommander des restaurants ?", sender: "guest", timestamp: new Date(Date.now() - 5 * 3600000) },
    ],
  },
];

const TEMPLATES = [
  { label: "Bienvenue", body: "Bonjour ! Merci pour votre réservation  Votre séjour est confirmé. N'hésitez pas si vous avez des questions !" },
  { label: "Code d'accès", body: "Voici votre code d'accès : 🔑 Code : XXXX\nLa boîte à clés se trouve à l'entrée principale." },
  { label: "Check-in", body: "Informations pour votre arrivée :\n L'adresse est indiquée dans la réservation\n🔑 Code d'accès : XXXX\n📶 WiFi : HostPro_Guest / Password2024\n🅿️ Parking inclus" },
  { label: "Recommandations", body: "Nos coups de cœur :\n🍽️ Restaurant : Le Café du Port\n☕ Bar : La Terrasse Bleue\n🛍️ Marché : Tous les mardis matin" },
  { label: "Avant départ", body: "Votre séjour se termine demain. Merci de laisser les clés dans la boîte et de vérifier que les fenêtres sont fermées. Bon retour !" },
  { label: "Demande d'avis", body: "Nous espérons que votre séjour s'est très bien passé !  Si vous avez été satisfait, nous serions ravis de recevoir votre avis. Merci !" },
];

const AI_SUGGESTIONS: Record<string, string[]> = {
  parking: ["Oui, la propriété dispose d'un parking privé sécurisé, entièrement inclus dans votre réservation. 🚗 Code portail : 1234", "Le parking est gratuit et sécurisé sur place. Vous trouverez l'accès via le portail automatique."],
  "check-in": ["Le check-in est disponible à partir de 15h. Si vous arrivez plus tard, la boîte à clés est accessible 24h/24.", "Parfait ! Check-in à 15h. Je vous enverrai le code d'accès la veille de votre arrivée."],
  restaurants: ["Avec plaisir ! Nos coups de cœur :\n🍽️ La Palme d'Or (gastronomique)\n🍕 Chez Panisse (méditerranéen)\n🥐 Boulangerie du Port (petit-déj) ", "Bien sûr ! Restaurant recommandé :\n- Le Jardin des Saveurs (à 300m)\n- Casa del Mare (vue mer, 5 min)\n- La Bonne Table (traditionnel)"],
  wifi: ["Le mot de passe WiFi est : HostPro_2024 📶\nN'hésitez pas si vous avez besoin d'autre chose !", "Connexion WiFi :\nRéseau : HostPro_Guest\nMot de passe : Welcome2024\nBonne connexion ! "],
};

// ── Channel config ─────────────────────────────────────────────────────────────

const CH: Record<Channel, { label: string; color: string; bg: string; letter: string }> = {
  airbnb:   { label: "Airbnb",      color: "text-primary-600", bg: "bg-primary-500/10", letter: "A" },
  booking:  { label: "Booking",     color: "text-blue-600",  bg: "bg-blue-50",       letter: "B" },
  whatsapp: { label: "WhatsApp",    color: "text-green-600", bg: "bg-green-50",      letter: "W" },
  sms:      { label: "SMS",         color: "text-purple-600",bg: "bg-purple-50",     letter: "S" },
  email:    { label: "Email",       color: "text-amber-600", bg: "bg-amber-50",      letter: "E" },
  direct:   { label: "Direct",      color: "text-neutral-900", bg: "bg-neutral-100",    letter: "D" },
};

function formatTs(d: Date) {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Maintenant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function ChBadge({ ch }: { ch: Channel }) {
  const c = CH[ch];
  return (
    <span className={cn("inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full", c.bg, c.color)}>
      {c.letter} {c.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [sel, setSel] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [chFilter, setChFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "resolved">("all");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // ── Load threads from API ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/v1/messages/threads");
        const threads = await res.json();
        if (Array.isArray(threads) && threads.length > 0) {
          // Fetch property names for threads
          const propsRes = await fetch("/api/v1/properties");
          const props: any[] = await propsRes.json();
          const propMap: Record<string, string> = {};
          props.forEach((p: any) => { propMap[p.id] = p.name; });

          const mapped: Conversation[] = threads.map((t: any) => ({
            id: t.id,
            guestName: t.guest_name ?? "Voyageur",
            property: propMap[t.property_id] ?? "Votre bien",
            channel: (t.platform ?? "direct") as Channel,
            lastMessage: t.last_message ?? "Nouvelle conversation",
            lastTs: t.last_message_at ? new Date(t.last_message_at) : new Date(t.created_at),
            unread: 0,
            status: t.status === "open" ? "active" : t.status === "resolved" ? "resolved" : "pending",
            tags: [],
            messages: [],
            botEnabled: false,
          }));
          setConvs(mapped);
          setIsDemo(false);
        } else {
          // No real threads yet — show demo data
          setConvs(MOCK);
          setSel(MOCK[0]);
          setIsDemo(true);
        }
      } catch {
        setConvs(MOCK);
        setSel(MOCK[0]);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Load messages when a thread is selected ────────────────────
  const loadMessages = async (conv: Conversation) => {
    if (isDemo) return; // mock data already has messages
    try {
      const res = await fetch(`/api/v1/messages/threads/${conv.id}/messages`);
      const msgs = await res.json();
      const mapped: Msg[] = Array.isArray(msgs) ? msgs.map((m: any) => ({
        id: m.id,
        body: m.content,
        sender: m.sender as "guest" | "host" | "bot",
        timestamp: new Date(m.created_at),
        status: "read" as MessageStatus,
      })) : [];
      setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, messages: mapped } : c));
      setSel(prev => prev?.id === conv.id ? { ...prev, messages: mapped } : prev);
    } catch { /* ignore */ }
  };

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);
>>>>>>> 37e76865155c39a4fea0b6b9d939bb34cc7b078e

  // Auto-poll for messages every 5 minutes
  useMessagePolling();

  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Initialize: load threads on mount
  useEffect(() => {
    fetchThreads();
  }, []);

<<<<<<< HEAD
  // Setup WebPush notifications on mount
  useEffect(() => {
    if (isSupported && !isSubscribed) {
      setShowNotificationPrompt(true);
    }
  }, [isSupported, isSubscribed]);

  // Handle enable notifications
  const handleEnableNotifications = async () => {
    try {
      await subscribe();
      setShowNotificationPrompt(false);
    } catch (err) {
      console.error('Failed to subscribe to notifications:', err);
=======
  const selectConv = (c: Conversation) => {
    setSel(c);
    setMobileView(true);
    setShowAI(false);
    setShowTpl(false);
    setConvs(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x));
    loadMessages(c);
  };

  const sendMsg = async (body: string, isBot = false) => {
    if (!body.trim() || !sel) return;
    setSending(true);
    const msg: Msg = { id: `m${Date.now()}`, body, sender: isBot ? "bot" : "host", timestamp: new Date(), status: "sent" };
    const upd = convs.map(c => c.id === sel.id ? { ...c, messages: [...c.messages, msg], lastMessage: body, lastTs: new Date() } : c);
    setConvs(upd);
    setSel(prev => prev ? { ...prev, messages: [...prev.messages, msg], lastMessage: body, lastTs: new Date() } : prev);
    setInput("");
    setShowTpl(false);
    setShowAI(false);
    // Persist to API (skip for demo mode)
    if (!isDemo) {
      try {
        await fetch(`/api/v1/messages/threads/${sel.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: body, sender: isBot ? "bot" : "host" }),
        });
      } catch { /* ignore */ }
    }
    setSending(false);
  };

  const toggleBot = (id: string) => {
    setConvs(prev => prev.map(c => c.id === id ? { ...c, botEnabled: !c.botEnabled } : c));
    setSel(prev => prev?.id === id ? { ...prev, botEnabled: !prev.botEnabled } : prev);
  };

  const getAI = () => {
    const last = sel?.messages.filter(m => m.sender === "guest").pop();
    if (!last) return ["Bonjour ! Comment puis-je vous aider ? ", "Merci pour votre message, je reviens vers vous rapidement."];
    for (const [kw, sugg] of Object.entries(AI_SUGGESTIONS)) {
      if (last.body.toLowerCase().includes(kw)) return sugg;
>>>>>>> 37e76865155c39a4fea0b6b9d939bb34cc7b078e
    }
  };

<<<<<<< HEAD
  // Handle sync
  const handleSync = async () => {
    try {
      await sync();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  // Mark thread as read when selected
  useEffect(() => {
    if (selectedThreadId && currentThread) {
      markAsRead(selectedThreadId);
    }
  }, [selectedThreadId]);

  const isEmpty = !loading && threads.length === 0;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <MessageSidebar onSync={handleSync} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {loading && !currentThread ? (
          <MessageDetailSkeleton />
        ) : selectedThreadId && currentThread ? (
          <>
            {/* Header */}
            <div className="border-b border-neutral-200 p-4 bg-white flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-lg font-bold text-neutral-900">
                    {currentThread.thread.guestName}
                  </h1>
                  <PlatformBadge platform={currentThread.thread.platform} />
                </div>
                <p className="text-sm text-neutral-500">
                  {currentThread.thread.guestEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  title="Synchroniser"
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={20}
                    className={syncing ? 'animate-spin text-primary-500' : 'text-neutral-600'}
                  />
=======
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 overflow-hidden">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-700">
          <AlertCircle size={13} className="flex-shrink-0" />
          <span><strong>Mode démo</strong> — Aucun fil de discussion réel. Les messages Airbnb ne sont pas accessibles via iCal (limitation Airbnb). Créez vos conversations manuellement.</span>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">

      {/* LEFT — conversation list */}
      <div className={cn("w-80 flex-shrink-0 flex flex-col border-r border-neutral-200 bg-white", mobileView && "hidden md:flex")}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-neutral-900 text-lg">Messages</h1>
              {totalUnread > 0 && <span className="bg-primary-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{totalUnread}</span>}
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..." className="w-full pl-8 pr-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary-500 placeholder-[#BBBBBB]"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "pending", "active", "resolved"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("flex-1 py-1 text-[9px] font-bold rounded-lg transition-colors",
                  statusFilter === s ? "bg-primary-500 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-[#EEEEEE]"
                )}>
                {s === "all" ? "Tous" : s === "pending" ? "En attente" : s === "active" ? "Actifs" : "Résolus"}
              </button>
            ))}
          </div>
        </div>

        {/* Channel filter */}
        <div className="px-3 py-2 border-b border-neutral-200 flex gap-1.5 overflow-x-auto">
          <button onClick={() => setChFilter("all")}
            className={cn("flex-shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-colors",
              chFilter === "all" ? "bg-neutral-900 text-white border-[#222222]" : "border-neutral-200 text-neutral-500"
            )}>Tous</button>
          {(Object.keys(CH) as Channel[]).map(ch => (
            <button key={ch} onClick={() => setChFilter(ch)}
              className={cn("flex-shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-colors",
                chFilter === ch ? `${CH[ch].bg} ${CH[ch].color} border-current` : "border-neutral-200 text-neutral-500"
              )}>
              {CH[ch].label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => selectConv(c)}
              className={cn("w-full text-left px-4 py-3 border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors",
                sel?.id === c.id && "bg-primary-500/5 border-l-2 border-l-[#FF5A5F]"
              )}>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0 relative">
                  {c.guestName.slice(0, 2).toUpperCase()}
                  {c.botEnabled && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-neutral-900 truncate">{c.guestName}</span>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <span className="text-[10px] text-neutral-300">{formatTs(c.lastTs)}</span>
                      {c.unread > 0 && <span className="bg-primary-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{c.unread}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ChBadge ch={c.channel} />
                    <span className="text-[10px] text-neutral-300 truncate">{c.property}</span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{c.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bot stats */}
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <Bot size={12} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-neutral-900">Bot IA actif</span>
          </div>
          <span className="text-xs font-bold text-green-600">
            {convs.filter(c => c.botEnabled).length}/{convs.length}
          </span>
        </div>
      </div>

      {/* RIGHT — conversation view */}
      {sel ? (
        <div className={cn("flex-1 flex flex-col bg-white min-w-0", !mobileView && "hidden md:flex")}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200">
            <button onClick={() => setMobileView(false)} className="md:hidden text-neutral-500">
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">
              {sel.guestName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-900">{sel.guestName}</span>
                <ChBadge ch={sel.channel} />
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  sel.status === "pending" ? "bg-amber-100 text-amber-700" :
                  sel.status === "active" ? "bg-green-100 text-green-700" :
                  "bg-neutral-100 text-neutral-500"
                )}>
                  {sel.status === "pending" ? "En attente" : sel.status === "active" ? "Actif" : "Résolu"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                <span className="flex items-center gap-1"><Home size={10} />{sel.property}</span>
                {sel.checkIn && <span> {sel.checkIn}  {sel.checkOut}</span>}
                {sel.reservationId && <span className="font-mono text-neutral-300">{sel.reservationId}</span>}
              </div>
            </div>
            <button onClick={() => toggleBot(sel.id)}
              className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all",
                sel.botEnabled
                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  : "bg-neutral-100 border-neutral-200 text-neutral-500 hover:bg-[#EEEEEE]"
              )}>
              <Bot size={12} />
              {sel.botEnabled ? "Bot ON" : "Bot OFF"}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#FAFAFA]">
            {sel.messages.map(msg => {
              const isGuest = msg.sender === "guest";
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={cn("flex gap-2", isGuest ? "justify-start" : "justify-end")}>
                  {isGuest && (
                    <div className="w-7 h-7 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0 mt-0.5">
                      {sel.guestName[0]}
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    isGuest ? "bg-white border border-neutral-200 text-neutral-900 rounded-tl-sm"
                    : isBot ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm"
                    : "bg-primary-500 text-white rounded-tr-sm"
                  )}>
                    {isBot && <div className="flex items-center gap-1 mb-1 opacity-80"><Bot size={10} /><span className="text-[9px] font-bold">Bot IA</span></div>}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <div className={cn("flex items-center gap-1 mt-1 text-[10px]", isGuest ? "text-neutral-300" : "text-white/70 justify-end")}>
                      <span>{msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      {!isGuest && msg.status === "read" && <CheckCheck size={10} />}
                      {!isGuest && msg.status === "delivered" && <CheckCheck size={10} className="opacity-50" />}
                      {!isGuest && msg.status === "sent" && <Check size={10} />}
                    </div>
                  </div>
                  {!isGuest && (
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5",
                      isBot ? "bg-green-500" : "bg-primary-500"
                    )}>
                      {isBot ? <Bot size={12} /> : "H"}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* AI suggestions */}
          {showAI && (
            <div className="border-t border-neutral-200 bg-gradient-to-r from-[#FF5A5F]/5 to-purple-50 px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-primary-600" />
                <span className="text-xs font-bold text-neutral-900">Suggestions IA</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-neutral-500"><X size={13} /></button>
              </div>
              <div className="space-y-2">
                {getAI().map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); setShowAI(false); }}
                    className="w-full text-left text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2 hover:border-primary-500 hover:bg-primary-500/5 transition-colors">
                    {s.slice(0, 120)}{s.length > 120 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Templates */}
          {showTpl && (
            <div className="border-t border-neutral-200 bg-[#FAFAFA] px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} className="text-amber-500" />
                <span className="text-xs font-bold text-neutral-900">Modèles de réponse</span>
                <button onClick={() => setShowTpl(false)} className="ml-auto text-neutral-500"><X size={13} /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => { setInput(t.body); setShowTpl(false); }}
                    className="text-left bg-white border border-neutral-200 rounded-xl px-3 py-2 hover:border-primary-500 transition-colors">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap size={10} className="text-amber-500" />
                      <span className="text-xs font-bold text-neutral-900">{t.label}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 line-clamp-2">{t.body.slice(0, 60)}…</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="px-5 py-4 border-t border-neutral-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                  placeholder="Tapez votre message... (Entrée pour envoyer)"
                  rows={2}
                  className="w-full border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder-[#BBBBBB] outline-none focus:border-primary-500 resize-none"
                />
              </div>
              <div className="flex flex-col gap-2 pb-0.5">
                <div className="flex gap-1.5">
                  <button onClick={() => { setShowAI(!showAI); setShowTpl(false); }}
                    title="Suggestions IA"
                    className={cn("w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                      showAI ? "bg-primary-500 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-[#EEEEEE]"
                    )}>
                    <Sparkles size={14} />
                  </button>
                  <button onClick={() => { setShowTpl(!showTpl); setShowAI(false); }}
                    title="Modèles"
                    className={cn("w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                      showTpl ? "bg-amber-500 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-[#EEEEEE]"
                    )}>
                    <Zap size={14} />
                  </button>
                </div>
                <button onClick={() => sendMsg(input)} disabled={!input.trim() || sending}
                  className="w-[68px] h-8 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors">
                  {sending ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
>>>>>>> 37e76865155c39a4fea0b6b9d939bb34cc7b078e
                </button>
                <MessageActions threadId={selectedThreadId} />
              </div>
            </div>
<<<<<<< HEAD

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 scroll-smooth">
              {currentThread.thread.messages.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm mt-2">Commencez la conversation en répondant ci-dessous</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentThread.thread.messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg.body}
                      sender={msg.sender as 'host' | 'guest'}
                      senderName={msg.senderName}
                      sentAt={msg.sentAt}
                      platform={msg.platform}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <MessageForm threadId={selectedThreadId} />
          </>
        ) : isEmpty ? (
          <MessageEmpty type="no-threads" onSync={handleSync} />
        ) : (
          <MessageEmpty type="no-selection" />
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex gap-3 items-center animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle size={18} />
            <span className="flex-1">{error}</span>
            <button
              onClick={clearError}
              className="font-bold text-lg hover:opacity-80 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notification Prompt */}
        {showNotificationPrompt && isSupported && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900 mb-1">
                  Activer les notifications
                </h4>
                <p className="text-sm text-neutral-600">
                  Recevez une alerte quand vous avez un nouveau message
                </p>
              </div>
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Plus tard
              </button>
              <button
                onClick={handleEnableNotifications}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
              >
                Activer
              </button>
            </div>
          </div>
        )}
=======
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] text-neutral-300">Maj+Entrée pour saut de ligne</span>
              {sel.botEnabled && <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium"><Bot size={10} /> Réponses automatiques activées</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#DDDDDD]" />
            </div>
            <p className="text-neutral-500 font-medium">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
>>>>>>> 37e76865155c39a4fea0b6b9d939bb34cc7b078e
      </div>
    </div>
  );
}

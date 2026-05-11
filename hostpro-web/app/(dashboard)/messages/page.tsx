"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Search, Send, Bot, Zap, Phone, Mail,
  Check, CheckCheck, Clock, Star, PlusCircle,
  Sparkles, Bell, ArrowLeft, X, AlertCircle, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    channel: "whatsapp", lastMessage: "Parfait merci beaucoup ! 😊",
    lastTs: new Date(Date.now() - 35 * 60000), unread: 0, status: "resolved",
    tags: ["wifi"], botEnabled: true,
    checkIn: "20 mai", checkOut: "25 mai",
    messages: [
      { id: "m1", body: "Bonjour, quel est le mot de passe wifi ?", sender: "guest", timestamp: new Date(Date.now() - 42 * 60000) },
      { id: "m2", body: "Bonjour Anna ! Le mot de passe WiFi est : VillaAzur2024 🔑\nN'hésitez pas si vous avez besoin d'autre chose !", sender: "bot", timestamp: new Date(Date.now() - 40 * 60000), status: "read" },
      { id: "m3", body: "Parfait merci beaucoup ! 😊", sender: "guest", timestamp: new Date(Date.now() - 35 * 60000) },
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
  { label: "Bienvenue", body: "Bonjour ! Merci pour votre réservation 🏠 Votre séjour est confirmé. N'hésitez pas si vous avez des questions !" },
  { label: "Code d'accès", body: "Voici votre code d'accès : 🔑 Code : XXXX\nLa boîte à clés se trouve à l'entrée principale." },
  { label: "Check-in", body: "Informations pour votre arrivée :\n🏠 L'adresse est indiquée dans la réservation\n🔑 Code d'accès : XXXX\n📶 WiFi : HostPro_Guest / Password2024\n🅿️ Parking inclus" },
  { label: "Recommandations", body: "Nos coups de cœur :\n🍽️ Restaurant : Le Café du Port\n☕ Bar : La Terrasse Bleue\n🛍️ Marché : Tous les mardis matin" },
  { label: "Avant départ", body: "Votre séjour se termine demain. Merci de laisser les clés dans la boîte et de vérifier que les fenêtres sont fermées. Bon retour !" },
  { label: "Demande d'avis", body: "Nous espérons que votre séjour s'est très bien passé ! 😊 Si vous avez été satisfait, nous serions ravis de recevoir votre avis. Merci !" },
];

const AI_SUGGESTIONS: Record<string, string[]> = {
  parking: ["Oui, la propriété dispose d'un parking privé sécurisé, entièrement inclus dans votre réservation. 🚗 Code portail : 1234", "Le parking est gratuit et sécurisé sur place. Vous trouverez l'accès via le portail automatique."],
  "check-in": ["Le check-in est disponible à partir de 15h. Si vous arrivez plus tard, la boîte à clés est accessible 24h/24.", "Parfait ! Check-in à 15h. Je vous enverrai le code d'accès la veille de votre arrivée."],
  restaurants: ["Avec plaisir ! Nos coups de cœur :\n🍽️ La Palme d'Or (gastronomique)\n🍕 Chez Panisse (méditerranéen)\n🥐 Boulangerie du Port (petit-déj) 😊", "Bien sûr ! Restaurant recommandé :\n- Le Jardin des Saveurs (à 300m)\n- Casa del Mare (vue mer, 5 min)\n- La Bonne Table (traditionnel)"],
  wifi: ["Le mot de passe WiFi est : HostPro_2024 📶\nN'hésitez pas si vous avez besoin d'autre chose !", "Connexion WiFi :\nRéseau : HostPro_Guest\nMot de passe : Welcome2024\nBonne connexion ! 😊"],
};

// ── Channel config ─────────────────────────────────────────────────────────────

const CH: Record<Channel, { label: string; color: string; bg: string; letter: string }> = {
  airbnb:   { label: "Airbnb",      color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", letter: "A" },
  booking:  { label: "Booking",     color: "text-blue-600",  bg: "bg-blue-50",       letter: "B" },
  whatsapp: { label: "WhatsApp",    color: "text-green-600", bg: "bg-green-50",      letter: "W" },
  sms:      { label: "SMS",         color: "text-purple-600",bg: "bg-purple-50",     letter: "S" },
  email:    { label: "Email",       color: "text-amber-600", bg: "bg-amber-50",      letter: "E" },
  direct:   { label: "Direct",      color: "text-[#222222]", bg: "bg-[#F7F7F7]",    letter: "D" },
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
  const [convs, setConvs] = useState<Conversation[]>(MOCK);
  const [sel, setSel] = useState<Conversation | null>(MOCK[0]);
  const [search, setSearch] = useState("");
  const [chFilter, setChFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "resolved">("all");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  const filtered = convs.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.guestName.toLowerCase().includes(q) || c.property.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)) &&
      (chFilter === "all" || c.channel === chFilter) &&
      (statusFilter === "all" || c.status === statusFilter)
    );
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sel?.messages.length]);

  const selectConv = (c: Conversation) => {
    setSel(c);
    setMobileView(true);
    setShowAI(false);
    setShowTpl(false);
    setConvs(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x));
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
    await new Promise(r => setTimeout(r, 400));
    setSending(false);
  };

  const toggleBot = (id: string) => {
    setConvs(prev => prev.map(c => c.id === id ? { ...c, botEnabled: !c.botEnabled } : c));
    setSel(prev => prev?.id === id ? { ...prev, botEnabled: !prev.botEnabled } : prev);
  };

  const getAI = () => {
    const last = sel?.messages.filter(m => m.sender === "guest").pop();
    if (!last) return ["Bonjour ! Comment puis-je vous aider ? 😊", "Merci pour votre message, je reviens vers vous rapidement."];
    for (const [kw, sugg] of Object.entries(AI_SUGGESTIONS)) {
      if (last.body.toLowerCase().includes(kw)) return sugg;
    }
    return ["Bonjour ! Comment puis-je vous aider ? 😊", "Merci pour votre message, je reviens vers vous rapidement."];
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 overflow-hidden">

      {/* LEFT — conversation list */}
      <div className={cn("w-80 flex-shrink-0 flex flex-col border-r border-[#DDDDDD] bg-white", mobileView && "hidden md:flex")}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-[#DDDDDD]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[#222222] text-lg">Messages</h1>
              {totalUnread > 0 && <span className="bg-[#FF5A5F] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{totalUnread}</span>}
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F7F7] text-[#717171] transition-colors">
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBBBBB]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..." className="w-full pl-8 pr-3 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl text-sm outline-none focus:border-[#FF5A5F] placeholder-[#BBBBBB]"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "pending", "active", "resolved"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("flex-1 py-1 text-[9px] font-bold rounded-lg transition-colors",
                  statusFilter === s ? "bg-[#FF5A5F] text-white" : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EEEEEE]"
                )}>
                {s === "all" ? "Tous" : s === "pending" ? "En attente" : s === "active" ? "Actifs" : "Résolus"}
              </button>
            ))}
          </div>
        </div>

        {/* Channel filter */}
        <div className="px-3 py-2 border-b border-[#DDDDDD] flex gap-1.5 overflow-x-auto">
          <button onClick={() => setChFilter("all")}
            className={cn("flex-shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-colors",
              chFilter === "all" ? "bg-[#222222] text-white border-[#222222]" : "border-[#DDDDDD] text-[#717171]"
            )}>Tous</button>
          {(Object.keys(CH) as Channel[]).map(ch => (
            <button key={ch} onClick={() => setChFilter(ch)}
              className={cn("flex-shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-colors",
                chFilter === ch ? `${CH[ch].bg} ${CH[ch].color} border-current` : "border-[#DDDDDD] text-[#717171]"
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
                sel?.id === c.id && "bg-[#FF5A5F]/5 border-l-2 border-l-[#FF5A5F]"
              )}>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-[#FF5A5F] text-sm font-bold flex-shrink-0 relative">
                  {c.guestName.slice(0, 2).toUpperCase()}
                  {c.botEnabled && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-[#222222] truncate">{c.guestName}</span>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <span className="text-[10px] text-[#BBBBBB]">{formatTs(c.lastTs)}</span>
                      {c.unread > 0 && <span className="bg-[#FF5A5F] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{c.unread}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ChBadge ch={c.channel} />
                    <span className="text-[10px] text-[#BBBBBB] truncate">{c.property}</span>
                  </div>
                  <p className="text-xs text-[#717171] truncate">{c.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bot stats */}
        <div className="px-4 py-3 border-t border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <Bot size={12} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-[#222222]">Bot IA actif</span>
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
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DDDDDD]">
            <button onClick={() => setMobileView(false)} className="md:hidden text-[#717171]">
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-[#FF5A5F] text-sm font-bold flex-shrink-0">
              {sel.guestName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#222222]">{sel.guestName}</span>
                <ChBadge ch={sel.channel} />
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  sel.status === "pending" ? "bg-amber-100 text-amber-700" :
                  sel.status === "active" ? "bg-green-100 text-green-700" :
                  "bg-[#F7F7F7] text-[#717171]"
                )}>
                  {sel.status === "pending" ? "En attente" : sel.status === "active" ? "Actif" : "Résolu"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#717171] mt-0.5">
                <span className="flex items-center gap-1"><Home size={10} />{sel.property}</span>
                {sel.checkIn && <span>📅 {sel.checkIn} → {sel.checkOut}</span>}
                {sel.reservationId && <span className="font-mono text-[#BBBBBB]">{sel.reservationId}</span>}
              </div>
            </div>
            <button onClick={() => toggleBot(sel.id)}
              className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all",
                sel.botEnabled
                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  : "bg-[#F7F7F7] border-[#DDDDDD] text-[#717171] hover:bg-[#EEEEEE]"
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
                    <div className="w-7 h-7 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center text-[#FF5A5F] text-xs font-bold flex-shrink-0 mt-0.5">
                      {sel.guestName[0]}
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    isGuest ? "bg-white border border-[#DDDDDD] text-[#222222] rounded-tl-sm"
                    : isBot ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm"
                    : "bg-[#FF5A5F] text-white rounded-tr-sm"
                  )}>
                    {isBot && <div className="flex items-center gap-1 mb-1 opacity-80"><Bot size={10} /><span className="text-[9px] font-bold">Bot IA</span></div>}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <div className={cn("flex items-center gap-1 mt-1 text-[10px]", isGuest ? "text-[#BBBBBB]" : "text-white/70 justify-end")}>
                      <span>{msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      {!isGuest && msg.status === "read" && <CheckCheck size={10} />}
                      {!isGuest && msg.status === "delivered" && <CheckCheck size={10} className="opacity-50" />}
                      {!isGuest && msg.status === "sent" && <Check size={10} />}
                    </div>
                  </div>
                  {!isGuest && (
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5",
                      isBot ? "bg-green-500" : "bg-[#FF5A5F]"
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
            <div className="border-t border-[#DDDDDD] bg-gradient-to-r from-[#FF5A5F]/5 to-purple-50 px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[#FF5A5F]" />
                <span className="text-xs font-bold text-[#222222]">Suggestions IA</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-[#717171]"><X size={13} /></button>
              </div>
              <div className="space-y-2">
                {getAI().map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); setShowAI(false); }}
                    className="w-full text-left text-xs bg-white border border-[#DDDDDD] rounded-xl px-3 py-2 hover:border-[#FF5A5F] hover:bg-[#FF5A5F]/5 transition-colors">
                    {s.slice(0, 120)}{s.length > 120 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Templates */}
          {showTpl && (
            <div className="border-t border-[#DDDDDD] bg-[#FAFAFA] px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} className="text-amber-500" />
                <span className="text-xs font-bold text-[#222222]">Modèles de réponse</span>
                <button onClick={() => setShowTpl(false)} className="ml-auto text-[#717171]"><X size={13} /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => { setInput(t.body); setShowTpl(false); }}
                    className="text-left bg-white border border-[#DDDDDD] rounded-xl px-3 py-2 hover:border-[#FF5A5F] transition-colors">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap size={10} className="text-amber-500" />
                      <span className="text-xs font-bold text-[#222222]">{t.label}</span>
                    </div>
                    <p className="text-[10px] text-[#717171] line-clamp-2">{t.body.slice(0, 60)}…</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="px-5 py-4 border-t border-[#DDDDDD] bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                  placeholder="Tapez votre message... (Entrée pour envoyer)"
                  rows={2}
                  className="w-full border border-[#DDDDDD] rounded-2xl px-4 py-3 text-sm text-[#222222] placeholder-[#BBBBBB] outline-none focus:border-[#FF5A5F] resize-none"
                />
              </div>
              <div className="flex flex-col gap-2 pb-0.5">
                <div className="flex gap-1.5">
                  <button onClick={() => { setShowAI(!showAI); setShowTpl(false); }}
                    title="Suggestions IA"
                    className={cn("w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                      showAI ? "bg-[#FF5A5F] text-white" : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EEEEEE]"
                    )}>
                    <Sparkles size={14} />
                  </button>
                  <button onClick={() => { setShowTpl(!showTpl); setShowAI(false); }}
                    title="Modèles"
                    className={cn("w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                      showTpl ? "bg-amber-500 text-white" : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EEEEEE]"
                    )}>
                    <Zap size={14} />
                  </button>
                </div>
                <button onClick={() => sendMsg(input)} disabled={!input.trim() || sending}
                  className="w-[68px] h-8 bg-[#FF5A5F] hover:bg-[#E00B41] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors">
                  {sending ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] text-[#BBBBBB]">Maj+Entrée pour saut de ligne</span>
              {sel.botEnabled && <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium"><Bot size={10} /> Réponses automatiques activées</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#DDDDDD]" />
            </div>
            <p className="text-[#717171] font-medium">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}

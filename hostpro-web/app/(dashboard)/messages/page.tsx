"use client";
import { useEffect, useState } from "react";
import { messagesApi } from "@/lib/api";
import { MessageThread } from "@/types";
import { MessageSquare, Send } from "lucide-react";

const formatTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const SOURCE_BADGE: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  sms: "bg-green-100 text-green-700",
  airbnb: "bg-[#FF5A5F]/10 text-[#FF5A5F]",
  whatsapp: "bg-green-100 text-green-700",
};

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selected, setSelected] = useState<MessageThread | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesApi.listThreads().then((r) => {
      setThreads(r.data);
      setLoading(false);
    });
  }, []);

  const selectThread = async (t: MessageThread) => {
    const full = await messagesApi.getThread(t.id);
    setSelected(full.data);
  };

  const send = async () => {
    if (!selected || !message.trim()) return;
    setSending(true);
    await messagesApi.sendMessage(selected.id, { content: message, direction: "outbound" });
    setMessage("");
    const updated = await messagesApi.getThread(selected.id);
    setSelected(updated.data);
    const all = await messagesApi.listThreads();
    setThreads(all.data);
    setSending(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-[#DDDDDD] shadow-sm overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="w-80 border-r border-[#DDDDDD] flex flex-col">
        <div className="px-4 py-4 border-b border-[#DDDDDD]">
          <h2 className="font-semibold text-[#222222] text-sm">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="w-10 h-10 bg-[#F7F7F7] rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#F7F7F7] rounded animate-pulse" />
                    <div className="h-3 bg-[#F7F7F7] rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare size={32} className="text-[#DDDDDD] mb-3" />
              <p className="text-[#717171] text-sm font-medium">Aucune conversation</p>
              <p className="text-[#717171] text-xs mt-1">Les messages de vos voyageurs apparaîtront ici</p>
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t)}
                className={`w-full text-left px-4 py-3.5 border-b border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors ${
                  selected?.id === t.id ? "bg-[#FF5A5F]/5 border-l-2 border-l-[#FF5A5F]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF5A5F] text-xs font-bold">
                      {(t.channel || "M")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-[#222222] capitalize truncate">
                        {t.channel || "Conversation"}
                      </span>
                      <span className="text-xs text-[#717171] flex-shrink-0 ml-2">
                        {formatTime(t.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          t.status === "open" ? "bg-green-100 text-green-700" : "bg-[#F7F7F7] text-[#717171]"
                        }`}
                      >
                        {t.status === "open" ? "Ouvert" : "Fermé"}
                      </span>
                      <span className="text-xs text-[#717171]">{t.messages?.length || 0} msg</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel — chat */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-[#DDDDDD] bg-white flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center">
              <span className="text-[#FF5A5F] text-sm font-bold">
                {(selected.channel || "M")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-[#222222] capitalize">{selected.channel}</div>
              <div className="text-xs text-[#717171]">{selected.messages?.length || 0} messages</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F7F7]/30">
            {(selected.messages || []).map((m) => (
              <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-sm px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    m.direction === "outbound"
                      ? "bg-[#FF5A5F] text-white rounded-br-sm"
                      : "bg-white border border-[#DDDDDD] text-[#222222] rounded-bl-sm"
                  }`}
                >
                  {m.is_automated && (
                    <div className={`text-xs mb-1 font-medium ${m.direction === "outbound" ? "text-white/60" : "text-[#717171]"}`}>
                      Message automatique
                    </div>
                  )}
                  <p className="leading-relaxed">{m.content}</p>
                  {m.created_at && (
                    <div
                      className={`text-xs mt-1.5 ${
                        m.direction === "outbound" ? "text-white/60" : "text-[#717171]"
                      }`}
                    >
                      {formatTime(m.created_at)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#DDDDDD] bg-white">
            <div className="flex gap-3">
              <textarea
                rows={2}
                className="flex-1 border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/10 resize-none transition-all"
                placeholder="Écrire un message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                onClick={send}
                disabled={sending || !message.trim()}
                className="flex-shrink-0 bg-[#FF5A5F] hover:bg-[#E00B41] text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#F7F7F7]/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#DDDDDD] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h3 className="font-semibold text-[#222222] mb-1">Sélectionnez une conversation</h3>
            <p className="text-[#717171] text-sm">Choisissez une conversation dans la liste à gauche</p>
          </div>
        </div>
      )}
    </div>
  );
}

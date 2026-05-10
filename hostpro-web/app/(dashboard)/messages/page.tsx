"use client";
import { useEffect, useState } from "react";
import { messagesApi } from "@/lib/api";
import { MessageThread } from "@/types";
import { MessageSquare, Send } from "lucide-react";

const formatTime = (d: string | null) => d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selected, setSelected] = useState<MessageThread | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesApi.listThreads().then((r) => { setThreads(r.data); setLoading(false); });
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
    <div className="h-screen flex flex-col">
      <div className="p-8 pb-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Messagerie</h1>
        <p className="text-slate-500 text-sm mt-0.5">Centralisation de toutes les communications voyageurs</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-slate-200 overflow-y-auto bg-white">
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            threads.map((t) => (
              <button key={t.id} onClick={() => selectThread(t)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected?.id === t.id ? "bg-slate-50" : ""}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-slate-900 capitalize">{t.channel}</span>
                  <span className="text-xs text-slate-400">{formatTime(t.last_message_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${t.status === "open" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {t.status === "open" ? "Ouvert" : "Fermé"}
                  </span>
                  <span className="text-xs text-slate-500">{t.messages?.length || 0} msg</span>
                </div>
              </button>
            ))
          )}
        </div>

        {selected ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(selected.messages || []).map((m) => (
                <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm ${
                    m.direction === "outbound"
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm"
                  }`}>
                    {m.is_automated && <div className="text-xs opacity-60 mb-1">Message automatique</div>}
                    <p>{m.content}</p>
                    {m.created_at && <div className={`text-xs mt-1.5 ${m.direction === "outbound" ? "text-slate-300" : "text-slate-400"}`}>
                      {formatTime(m.created_at)}
                    </div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <textarea
                  rows={2}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  placeholder="Écrire un message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button onClick={send} disabled={sending || !message.trim()}
                  className="flex-shrink-0 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

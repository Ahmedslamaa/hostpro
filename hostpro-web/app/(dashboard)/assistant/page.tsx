"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "Comment optimiser le taux d'occupation de mes propriétés ?",
  "Rédige un message de bienvenue pour mes voyageurs",
  "Quelles sont les règles de conformité loi Le Meur ?",
  "Analyse les performances et donne des conseils",
  "Comment fixer le bon prix pour la haute saison ?",
  "Génère une checklist de ménage pour une villa",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre Assistant IA HOST PRO. Je connais vos propriétés et réservations et peux vous aider à optimiser votre activité locative. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent, streaming: true };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fullContent, streaming: false };
        return updated;
      });
    } catch {
      const demoReply = "Je suis en mode démo (clé API Anthropic non configurée). Pour activer l'IA, ajoutez votre `ANTHROPIC_API_KEY` dans `.env.local`.";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: demoReply, streaming: false };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-[#FF5A5F]" />
          </div>
          <div>
            <h2 className="font-bold text-[#222222] text-sm">Assistant IA HOST PRO</h2>
            <p className="text-xs text-[#717171]">Propulsé par Claude (Anthropic)</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: "assistant", content: "Bonjour ! Comment puis-je vous aider ?" }])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#717171] border border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors"
        >
          <RefreshCw size={12} />
          Nouvelle conversation
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#DDDDDD] p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === "assistant"
                ? "bg-[#FF5A5F]/10 border border-[#FF5A5F]/20"
                : "bg-[#222222] text-white"
            }`}>
              {msg.role === "assistant" ? <Bot size={14} className="text-[#FF5A5F]" /> : <User size={14} />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#222222] text-white rounded-tr-md"
                : "bg-[#F7F7F7] text-[#222222] rounded-tl-md"
            }`}>
              {msg.content || (msg.streaming && (
                <span className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-[#717171] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#717171] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#717171] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (seulement au début) */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-xl border border-[#DDDDDD] bg-white text-[#717171] hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question… (Entrée pour envoyer)"
          rows={2}
          className="flex-1 px-4 py-3 bg-white border border-[#DDDDDD] rounded-2xl text-sm text-[#222222] resize-none focus:outline-none focus:border-[#FF5A5F] placeholder:text-[#717171]"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-[#FF5A5F] text-white rounded-2xl flex items-center justify-center hover:bg-[#e04e53] transition-colors disabled:opacity-40 flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

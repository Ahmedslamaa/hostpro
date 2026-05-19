"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

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
    <div style={{ height: "calc(100vh - 8rem)", display: "flex", flexDirection: "column", gap: 0, maxWidth: 768, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, background: "rgba(224,32,96,0.08)",
            border: "1px solid rgba(224,32,96,0.15)", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={17} style={{ color: ROSE }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, color: INK, fontSize: 13, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Assistant IA HOST PRO</h2>
            <p style={{ fontSize: 11, color: INK_SOFT }}>Propulsé par Claude (Anthropic)</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: "assistant", content: "Bonjour ! Comment puis-je vous aider ?" }])}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600,
            color: INK_SOFT, border: "1px solid rgba(0,0,0,0.1)",
            background: "white", cursor: "pointer",
          }}
        >
          <RefreshCw size={11} />
          Nouvelle conversation
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", background: "white",
        borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }} className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: msg.role === "assistant" ? "rgba(224,32,96,0.08)" : INK,
              border: msg.role === "assistant" ? "1px solid rgba(224,32,96,0.15)" : "none",
            }}>
              {msg.role === "assistant"
                ? <Bot size={13} style={{ color: ROSE }} />
                : <User size={13} style={{ color: "white" }} />
              }
            </div>
            <div style={{
              maxWidth: "75%", borderRadius: 18, padding: "12px 16px",
              fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
              background: msg.role === "user" ? INK : PAPER,
              color: msg.role === "user" ? "white" : INK,
              borderTopRightRadius: msg.role === "user" ? 4 : 18,
              borderTopLeftRadius: msg.role === "assistant" ? 4 : 18,
            }}>
              {msg.content || (msg.streaming && (
                <span className="flex gap-1 items-center h-4">
                  <span style={{ width: 6, height: 6, background: INK_SOFT, borderRadius: "50%" }} className="animate-bounce" />
                  <span style={{ width: 6, height: 6, background: INK_SOFT, borderRadius: "50%", animationDelay: "150ms" }} className="animate-bounce" />
                  <span style={{ width: 6, height: 6, background: INK_SOFT, borderRadius: "50%", animationDelay: "300ms" }} className="animate-bounce" />
                </span>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)", background: "white",
                color: INK_SOFT, cursor: "pointer",
              }}
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
          style={{
            flex: 1, padding: "12px 16px", background: "white",
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 18,
            fontSize: 13, color: INK, resize: "none", outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{
            width: 44, height: 44, background: ROSE, color: "white",
            borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", opacity: (!input.trim() || loading) ? 0.4 : 1, flexShrink: 0,
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

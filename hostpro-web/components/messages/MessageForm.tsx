'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';
import { Send, Loader2 } from 'lucide-react';

const INK   = "#1A0E12";
const SOFT  = "#6B5A60";
const ROSE  = "#E02060";
const PAPER = "#F4F2F0";
const SANS  = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO  = "'JetBrains Mono', ui-monospace, monospace";

const MAX_CHARS = 2000;

interface MessageFormProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function MessageForm({ threadId, onMessageSent }: MessageFormProps) {
  const [message, setMessage]  = useState('');
  const [sending, setSending]  = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const [success, setSuccess]  = useState(false);
  const textareaRef            = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, getDraft, saveDraft } = useMessagesStore();

  // Load draft on mount / thread change
  useEffect(() => {
    const draft = getDraft(threadId);
    setMessage(draft);
    setError(null);
  }, [threadId]);

  // Auto-save draft (debounced 500 ms)
  useEffect(() => {
    const t = setTimeout(() => saveDraft(threadId, message), 500);
    return () => clearTimeout(t);
  }, [message, threadId]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    if (trimmed.length > MAX_CHARS) {
      setError(`Message trop long (max ${MAX_CHARS} caractères)`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      await sendMessage(threadId, trimmed);
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onMessageSent?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  // Ctrl/Cmd+Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as any);
    }
    // Escape to clear
    if (e.key === 'Escape') {
      setMessage('');
      setError(null);
    }
  };

  const charCount   = message.length;
  const overLimit   = charCount > MAX_CHARS;
  const canSend     = message.trim().length > 0 && !sending && !overLimit;

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
      {/* Error banner */}
      {error && (
        <div style={{
          margin: '0 16px', marginTop: 10,
          background: 'rgba(192,0,64,0.06)', border: '1px solid rgba(192,0,64,0.15)',
          borderRadius: 8, padding: '8px 12px',
          fontFamily: SANS, fontSize: 12, color: '#C00040',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ⚠ {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#C00040', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ padding: '12px 16px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          border: `1.5px solid ${overLimit ? '#C00040' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 14, background: PAPER, padding: '10px 14px',
          transition: 'border-color 0.15s',
        }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre réponse… (Ctrl+Entrée pour envoyer)"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: SANS, fontSize: 14, color: INK,
              resize: 'none', lineHeight: 1.55, minHeight: 24, maxHeight: 160,
              overflow: 'auto',
            }}
          />
          <button
            type="submit"
            disabled={!canSend}
            title="Envoyer (Ctrl+Entrée)"
            style={{
              flexShrink: 0,
              width: 38, height: 38,
              borderRadius: 10,
              border: 'none',
              background: canSend ? ROSE : 'rgba(0,0,0,0.08)',
              color: canSend ? 'white' : SOFT,
              cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            {sending
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={15} />
            }
          </button>
        </div>

        {/* Footer: char counter + hint */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingLeft: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: SOFT, letterSpacing: '0.06em' }}>
            CTRL+ENTRÉE POUR ENVOYER
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.06em',
            color: overLimit ? '#C00040' : SOFT,
          }}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </form>
    </div>
  );
}

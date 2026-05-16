'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';

interface MessageFormProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function MessageForm({ threadId, onMessageSent }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, getDraft, saveDraft } = useMessagesStore();

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft(threadId);
    setMessage(draft);
  }, [threadId, getDraft]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(threadId, message);
    }, 500);

    return () => clearTimeout(timer);
  }, [message, threadId, saveDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendMessage(threadId, message);
      setMessage('');
      onMessageSent?.();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l envoi');
    } finally {
      setSending(false);
    }
  };

  // Hotkey Ctrl+Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200">
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre reponse... (Ctrl+Entree pour envoyer)"
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {sending ? '...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}

'use client';

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

const INK = "#1A0E12";
const INK_SOFT = "#6B5A60";
const ROSE = "#E02060";
const PAPER = "#F4F2F0";

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

  const { isSubscribed, isSupported, subscribe } = useWebPushSubscription();
  useMessagePolling();

  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (isSupported && !isSubscribed) {
      setShowNotificationPrompt(true);
    }
  }, [isSupported, isSubscribed]);

  const handleEnableNotifications = async () => {
    try {
      await subscribe();
      setShowNotificationPrompt(false);
    } catch (err) {
      console.error('Failed to subscribe to notifications:', err);
    }
  };

  const handleSync = async () => {
    try {
      await sync();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  useEffect(() => {
    if (selectedThreadId && currentThread) {
      markAsRead(selectedThreadId);
    }
  }, [selectedThreadId]);

  const isEmpty = !loading && threads.length === 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "white", overflow: "hidden" }}>
      {/* Sidebar */}
      <MessageSidebar onSync={handleSync} />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        {loading && !currentThread ? (
          <MessageDetailSkeleton />
        ) : selectedThreadId && currentThread ? (
          <>
            {/* Header */}
            <div style={{
              borderBottom: "1px solid rgba(0,0,0,0.06)", padding: 16,
              background: "white", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3 mb-1">
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    {currentThread.thread.guestName}
                  </h1>
                  <PlatformBadge platform={currentThread.thread.platform} />
                </div>
                <p style={{ fontSize: 12, color: INK_SOFT }}>
                  {currentThread.thread.guestEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  title="Synchroniser"
                  style={{
                    padding: 8, borderRadius: 10, border: "none", background: "transparent",
                    cursor: "pointer", color: syncing ? ROSE : INK_SOFT,
                  }}
                >
                  <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                </button>
                <MessageActions threadId={selectedThreadId} />
              </div>
            </div>

            {/* Messages Container */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, background: PAPER }} className="scroll-smooth">
              {currentThread.thread.messages.length === 0 ? (
                <div style={{ textAlign: "center", color: INK_SOFT, padding: "32px 0" }}>
                  <p>Aucun message pour le moment</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>Commencez la conversation en répondant ci-dessous</p>
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
          <div style={{
            position: "fixed", bottom: 16, right: 16,
            background: "#C00040", color: "white", padding: "12px 16px",
            borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            display: "flex", gap: 12, alignItems: "center",
          }} className="animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle size={17} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={clearError} style={{ fontWeight: 800, fontSize: 16, background: "none", border: "none", color: "white", cursor: "pointer", marginLeft: 16 }}>
              ✕
            </button>
          </div>
        )}

        {/* Notification Prompt */}
        {showNotificationPrompt && isSupported && (
          <div style={{
            position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "white", border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            padding: 16, maxWidth: 360, width: "100%",
          }} className="animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 700, color: INK, marginBottom: 4, fontSize: 14 }}>
                  Activer les notifications
                </h4>
                <p style={{ fontSize: 12, color: INK_SOFT }}>
                  Recevez une alerte quand vous avez un nouveau message
                </p>
              </div>
              <button
                onClick={() => setShowNotificationPrompt(false)}
                style={{ color: INK_SOFT, background: "none", border: "none", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNotificationPrompt(false)}
                style={{
                  flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 600,
                  color: INK_SOFT, background: "transparent", border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 10, cursor: "pointer",
                }}
              >
                Plus tard
              </button>
              <button
                onClick={handleEnableNotifications}
                style={{
                  flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 700,
                  background: ROSE, color: "white", border: "none", borderRadius: 10, cursor: "pointer",
                }}
              >
                Activer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

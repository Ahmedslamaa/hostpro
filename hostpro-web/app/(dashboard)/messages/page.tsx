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

  // Auto-poll for messages every 5 minutes
  useMessagePolling();

  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Initialize: load threads on mount
  useEffect(() => {
    fetchThreads();
  }, []);

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
    }
  };

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
                </button>
                <MessageActions threadId={selectedThreadId} />
              </div>
            </div>

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
      </div>
    </div>
  );
}

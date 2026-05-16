'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
  message: string;
  sender: 'host' | 'guest';
  senderName: string;
  sentAt: string;
  platform?: string;
}

export function MessageBubble({
  message,
  sender,
  senderName,
  sentAt,
  platform
}: MessageBubbleProps) {
  const isHost = sender === 'host';
  const date = new Date(sentAt);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true, locale: fr });

  return (
    <div className={`flex ${isHost ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs px-4 py-3 rounded-lg ${
          isHost
            ? 'bg-blue-100 text-blue-900'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {!isHost && (
          <p className="text-xs font-semibold text-gray-600 mb-1">
            {senderName}
          </p>
        )}

        <p className="text-sm break-words">{message}</p>

        <p className={`text-xs mt-2 ${
          isHost ? 'text-blue-700' : 'text-gray-600'
        }`}>
          {relativeTime}
        </p>
      </div>
    </div>
  );
}

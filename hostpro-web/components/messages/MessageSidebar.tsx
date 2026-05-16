'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';
import { PlatformBadge } from './PlatformBadge';

interface MessageSidebarProps {
  onSync?: () => void | Promise<void>;
}

export function MessageSidebar({ onSync }: MessageSidebarProps = {}) {
  const { threads, selectedThreadId, selectThread, setFilter, filters, totalUnread } = useMessagesStore();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');

  // Filtrer les threads
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const matchesSearch = search === '' || 
        thread.guestName.toLowerCase().includes(search.toLowerCase()) ||
        thread.guestEmail?.toLowerCase().includes(search.toLowerCase());
      
      const matchesPlatform = platformFilter === '' || thread.platform === platformFilter;
      
      return matchesSearch && matchesPlatform;
    });
  }, [threads, search, platformFilter]);

  return (
    <div className="w-80 bg-neutral-50 border-r border-neutral-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Messages</h2>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
        />

        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Toutes les plateformes</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking</option>
          <option value="abritel">Abritel</option>
        </select>

        {/* Unread Count */}
        {totalUnread > 0 && (
          <div className="mt-3 text-sm text-primary-600 font-medium">
            {totalUnread} message{totalUnread > 1 ? 's' : ''} non lu{totalUnread > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-sm">
            Aucun message
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              className={`p-4 cursor-pointer border-b border-neutral-200 hover:bg-neutral-100 transition-colors ${
                selectedThreadId === thread.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-neutral-900 text-sm truncate">
                  {thread.guestName}
                </h3>
                <PlatformBadge platform={thread.platform} size="sm" />
              </div>

              {/* Preview */}
              <p className="text-xs text-neutral-500 truncate mb-2">
                {thread.preview || 'Pas de message'}
              </p>

              {/* Footer */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">
                  {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString() : 'N/A'}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

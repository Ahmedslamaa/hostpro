'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useMessagesStore, MessageThreadUI } from '@/stores/messagesStore';
import { PlatformBadge } from './PlatformBadge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';

const INK    = "#1A0E12";
const SOFT   = "#6B5A60";
const ROSE   = "#E02060";
const PAPER  = "#F4F2F0";
const BORDER = "rgba(0,0,0,0.07)";
const SANS   = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO   = "'JetBrains Mono', ui-monospace, monospace";

interface MessageSidebarProps {
  onSync?: () => void | Promise<void>;
}

export function MessageSidebar({ onSync }: MessageSidebarProps = {}) {
  const { threads, selectedThreadId, selectThread, filters, setFilter, totalUnread, syncing, fetchThreads } = useMessagesStore();
  const [search, setSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilter({ search: search || undefined });
    }, 300);
    return () => clearTimeout(t);
  }, [search, setFilter]);

  // Re-fetch when filter changes
  useEffect(() => {
    fetchThreads();
  }, [filters.platform, filters.status]);

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((t) =>
      !q ||
      t.guestName.toLowerCase().includes(q) ||
      t.guestEmail?.toLowerCase().includes(q) ||
      t.preview?.toLowerCase().includes(q)
    );
  }, [threads, search]);

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ platform: e.target.value || undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ status: e.target.value || 'open' });
  };

  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: PAPER, borderRight: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, color: INK, margin: 0 }}>
              Messages
            </h2>
            {totalUnread > 0 && (
              <span style={{
                background: ROSE, color: 'white',
                fontSize: 10, fontWeight: 700, fontFamily: MONO,
                padding: '2px 7px', borderRadius: 20,
              }}>
                {totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onSync}
            disabled={syncing}
            title="Synchroniser"
            style={{
              padding: 7, borderRadius: 10, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: syncing ? ROSE : SOFT,
              transition: 'color 0.15s',
            }}
          >
            <RefreshCw size={16} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: SOFT }} />
          <input
            type="text"
            placeholder="Rechercher un voyageur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 32px',
              border: `1px solid ${BORDER}`, borderRadius: 10,
              background: 'white', fontFamily: SANS, fontSize: 13, color: INK,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={filters.platform || ''}
            onChange={handlePlatformChange}
            style={{
              flex: 1, padding: '7px 10px',
              border: `1px solid ${BORDER}`, borderRadius: 8,
              background: 'white', fontFamily: MONO, fontSize: 10,
              color: SOFT, outline: 'none', letterSpacing: '0.06em',
            }}
          >
            <option value="">TOUTES PLATEFORMES</option>
            <option value="airbnb">AIRBNB</option>
            <option value="booking">BOOKING</option>
            <option value="abritel">ABRITEL</option>
          </select>
          <select
            value={filters.status || 'open'}
            onChange={handleStatusChange}
            style={{
              flex: 1, padding: '7px 10px',
              border: `1px solid ${BORDER}`, borderRadius: 8,
              background: 'white', fontFamily: MONO, fontSize: 10,
              color: SOFT, outline: 'none', letterSpacing: '0.06em',
            }}
          >
            <option value="open">OUVERT</option>
            <option value="closed">FERMÉ</option>
            <option value="archived">ARCHIVÉ</option>
          </select>
        </div>
      </div>

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredThreads.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <MessageSquare size={28} style={{ color: SOFT, opacity: 0.5, margin: '0 auto 10px' }} />
            <p style={{ fontFamily: SANS, fontSize: 13, color: SOFT }}>
              {search ? 'Aucun résultat' : 'Aucune conversation'}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              isSelected={selectedThreadId === thread.id}
              onClick={() => selectThread(thread.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ThreadRow({ thread, isSelected, onClick }: {
  thread: MessageThreadUI;
  isSelected: boolean;
  onClick: () => void;
}) {
  const relative = thread.lastMessageAt
    ? formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true, locale: fr })
    : '';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        cursor: 'pointer',
        background: isSelected ? 'rgba(224,32,96,0.04)' : 'transparent',
        borderLeft: isSelected ? `3px solid ${ROSE}` : '3px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: thread.unreadCount > 0 ? 800 : 600,
          fontSize: 13, color: INK,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flex: 1, marginRight: 8,
        }}>
          {thread.guestName}
        </span>
        <PlatformBadge platform={thread.platform} size="sm" />
      </div>

      {/* Preview */}
      <p style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: 12, color: thread.unreadCount > 0 ? INK : SOFT,
        fontWeight: thread.unreadCount > 0 ? 500 : 400,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        margin: '4px 0', lineHeight: 1.4,
      }}>
        {thread.preview || 'Aucun message'}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9, color: SOFT, letterSpacing: '0.06em' }}>
          {relative}
        </span>
        {thread.unreadCount > 0 && (
          <span style={{
            background: ROSE, color: 'white',
            fontSize: 10, fontWeight: 700,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center',
          }}>
            {thread.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { MoreVertical, Archive, CheckCircle, Inbox, Trash2 } from 'lucide-react';
import { useMessagesStore } from '@/stores/messagesStore';
import { api } from '@/lib/api';

const INK  = "#1A0E12";
const SOFT = "#6B5A60";
const ROSE = "#E02060";

interface MessageActionsProps {
  threadId: string;
  currentStatus?: string;
}

export function MessageActions({ threadId, currentStatus = 'open' }: MessageActionsProps) {
  const [isOpen, setIsOpen]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchThreads, reset }  = useMessagesStore();

  const updateStatus = async (status: string) => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      await api.patch(`/messages/threads/${threadId}/status`, { status });
      // Refresh the list
      await fetchThreads();
      // If archiving or closing, deselect current thread
      if (status !== 'open') {
        reset();
        // Re-fetch with current filter
        await fetchThreads();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    currentStatus !== 'open'    && { icon: Inbox,       label: 'Rouvrir',        status: 'open',     danger: false },
    currentStatus !== 'closed'  && { icon: CheckCircle, label: 'Marquer fermé',   status: 'closed',   danger: false },
    currentStatus !== 'archived'&& { icon: Archive,     label: 'Archiver',        status: 'archived', danger: false },
  ].filter(Boolean) as { icon: any; label: string; status: string; danger: boolean }[];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        title="Actions"
        style={{
          padding: 8, borderRadius: 10, border: 'none',
          background: 'transparent', cursor: isLoading ? 'not-allowed' : 'pointer',
          color: SOFT, opacity: isLoading ? 0.5 : 1,
          transition: 'background 0.1s',
        }}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div style={{
            position: 'absolute', right: 0, top: 40,
            background: 'white', borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 180, zIndex: 50,
            overflow: 'hidden',
          }}>
            {actions.map(({ icon: Icon, label, status, danger }) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: 13, fontWeight: 500,
                  color: danger ? ROSE : INK,
                  transition: 'background 0.1s',
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Icon size={15} style={{ color: danger ? ROSE : SOFT, flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Copy, Check } from 'lucide-react';

const INK   = "#1A0E12";
const SOFT  = "#6B5A60";
const ROSE  = "#E02060";
const PAPER = "#F4F2F0";
const MONO  = "'JetBrains Mono', ui-monospace, monospace";
const SANS  = "'Plus Jakarta Sans', system-ui, sans-serif";

const PLATFORM_COLORS: Record<string, string> = {
  airbnb:  '#FF5A5F',
  booking: '#003580',
  abritel: '#FF6B35',
  direct:  '#6B5A60',
};

interface MessageBubbleProps {
  message: string;
  sender: 'host' | 'guest';
  senderName: string;
  sentAt: string;
  platform?: string;
}

export function MessageBubble({ message, sender, senderName, sentAt, platform }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showAbsolute, setShowAbsolute] = useState(false);
  const isHost = sender === 'host';

  const date     = new Date(sentAt);
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: fr });
  const absolute = format(date, "d MMM yyyy, HH:mm", { locale: fr });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{ display: 'flex', justifyContent: isHost ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
      {/* Guest avatar */}
      {!isHost && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: platform ? PLATFORM_COLORS[platform] || SOFT : SOFT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 12, fontWeight: 700, fontFamily: SANS,
          marginRight: 10, marginTop: 4,
        }}>
          {senderName?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: '68%', position: 'relative' }} className="group">
        {/* Sender name for guest */}
        {!isHost && (
          <div style={{
            fontFamily: MONO, fontSize: 10, color: SOFT,
            letterSpacing: '0.08em', marginBottom: 4,
          }}>
            {senderName}
          </div>
        )}

        {/* Message bubble */}
        <div style={{
          position: 'relative',
          background: isHost ? INK : 'white',
          color: isHost ? PAPER : INK,
          borderRadius: isHost ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '12px 16px',
          boxShadow: isHost
            ? '0 2px 12px rgba(26,14,18,0.15)'
            : '0 2px 12px rgba(0,0,0,0.06)',
          border: isHost ? 'none' : '1px solid rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message}
          </p>

          {/* Copy button (visible on hover) */}
          <button
            onClick={handleCopy}
            title="Copier"
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isHost ? 'rgba(244,242,240,0.5)' : SOFT,
              opacity: 0, transition: 'opacity 0.15s',
              padding: 2, borderRadius: 4,
            }}
            className="group-hover:!opacity-100"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.06em',
            color: SOFT, marginTop: 4, cursor: 'default',
            textAlign: isHost ? 'right' : 'left',
          }}
          onMouseEnter={() => setShowAbsolute(true)}
          onMouseLeave={() => setShowAbsolute(false)}
          title={absolute}
        >
          {showAbsolute ? absolute : relative}
        </div>
      </div>

      {/* Host avatar */}
      {isHost && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: ROSE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 12, fontWeight: 700, fontFamily: SANS,
          marginLeft: 10, marginTop: 4,
        }}>
          H
        </div>
      )}
    </div>
  );
}

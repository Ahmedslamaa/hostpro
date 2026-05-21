'use client';

import { MessageSquare, RefreshCw, Inbox } from 'lucide-react';

const INK   = "#1A0E12";
const SOFT  = "#6B5A60";
const ROSE  = "#E02060";
const GOLD  = "#C0A060";
const SANS  = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO  = "'JetBrains Mono', ui-monospace, monospace";

interface MessageEmptyProps {
  type?: 'no-threads' | 'no-selection';
  onSync?: () => void | Promise<void>;
}

export function MessageEmpty({ type = 'no-selection', onSync }: MessageEmptyProps) {
  if (type === 'no-threads') {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #F4F2F0 0%, white 100%)',
        padding: 48, textAlign: 'center',
      }}>
        {/* Icon container */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(192,0,64,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          border: '1px solid rgba(192,0,64,0.12)',
        }}>
          <Inbox size={32} style={{ color: ROSE, opacity: 0.8 }} />
        </div>

        {/* Badge */}
        <div style={{
          fontFamily: MONO, fontSize: 9, color: GOLD,
          letterSpacing: '0.2em', fontWeight: 700, marginBottom: 12,
        }}>
          INBOX UNIFIÉE
        </div>

        <h3 style={{
          fontFamily: SANS, fontWeight: 800, fontSize: 22,
          color: INK, margin: '0 0 10px', letterSpacing: '-0.02em',
        }}>
          Aucune conversation
        </h3>

        <p style={{
          fontFamily: SANS, fontSize: 14, color: SOFT,
          maxWidth: 340, lineHeight: 1.6, margin: '0 0 28px',
        }}>
          Vos conversations Airbnb, Booking et Abritel s'afficheront ici.
          Synchronisez vos intégrations pour commencer.
        </p>

        {onSync && (
          <button
            onClick={onSync}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px',
              background: INK, color: '#F4F2F0',
              border: 'none', borderRadius: 12,
              fontFamily: SANS, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '-0.01em',
            }}
          >
            <RefreshCw size={16} />
            Synchroniser maintenant
          </button>
        )}
      </div>
    );
  }

  // no-selection state
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'white', padding: 48, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: '#F4F2F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <MessageSquare size={28} style={{ color: SOFT, opacity: 0.5 }} />
      </div>

      <h3 style={{
        fontFamily: SANS, fontWeight: 700, fontSize: 16,
        color: INK, margin: '0 0 8px',
      }}>
        Choisissez une conversation
      </h3>

      <p style={{ fontFamily: SANS, fontSize: 13, color: SOFT, maxWidth: 260, lineHeight: 1.6 }}>
        Sélectionnez un thread à gauche pour lire et répondre aux messages.
      </p>
    </div>
  );
}

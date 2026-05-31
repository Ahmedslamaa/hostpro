'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Download, Share } from 'lucide-react';

const INK   = "#1A0E12";
const SOFT  = "#6B5A60";
const ROSE  = "#E02060";
const GOLD  = "#C0A060";
const PAPER = "#F4F2F0";
const SANS  = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO  = "'JetBrains Mono', ui-monospace, monospace";

type Platform = 'desktop' | 'ios' | 'android' | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform]   = useState<Platform>(null);
  const [visible, setVisible]     = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;           // already installed
    if (localStorage.getItem('pwa-dismissed')) return; // user dismissed before

    const plt = detectPlatform();
    setPlatform(plt);

    // Desktop / Android: listen for native install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 s on the site
      setTimeout(() => setVisible(true), 30_000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show guide after 20 s
    if (plt === 'ios') {
      setTimeout(() => setVisible(true), 20_000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  // ── iOS "Add to Home Screen" guide ────────────────────────────────────────
  if (showIOSGuide) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(26,14,18,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 16px 32px',
      }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: '0.15em', fontWeight: 700 }}>
              INSTALLER SUR IOS
            </span>
            <button onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: SOFT }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { n: 1, icon: <Share size={18} style={{ color: ROSE }} />, text: 'Appuyez sur le bouton Partager en bas de Safari' },
              { n: 2, icon: <span style={{ fontSize: 18 }}>📋</span>,    text: 'Faites défiler et appuyez sur « Sur l\'écran d\'accueil »' },
              { n: 3, icon: <span style={{ fontSize: 18 }}>✅</span>,    text: 'Appuyez sur « Ajouter » en haut à droite' },
            ].map(({ n, icon, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(224,32,96,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK, margin: 0, lineHeight: 1.5, paddingTop: 6 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop / Android install banner ──────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9990, width: 'calc(100% - 32px)', maxWidth: 420,
      background: 'white',
      borderRadius: 20,
      boxShadow: '0 8px 40px rgba(26,14,18,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.06)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideUp 0.3s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
        background: INK,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/icon-192.png" alt="HostPro" width={52} height={52} style={{ display: 'block' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, color: INK, marginBottom: 2 }}>
          Installer HostPro
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: SOFT, lineHeight: 1.4 }}>
          Accès rapide depuis votre bureau
        </div>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        disabled={installing}
        style={{
          flexShrink: 0,
          background: ROSE, color: 'white',
          border: 'none', borderRadius: 12,
          padding: '9px 16px',
          fontFamily: SANS, fontWeight: 700, fontSize: 13,
          cursor: installing ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          opacity: installing ? 0.7 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        <Download size={14} />
        {installing ? '...' : 'Installer'}
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          cursor: 'pointer', color: SOFT, padding: 4,
        }}
      >
        <X size={18} />
      </button>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

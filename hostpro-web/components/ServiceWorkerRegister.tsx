'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // Check for SW updates every time the tab regains focus
        const handleFocus = () => reg.update().catch(() => {});
        window.addEventListener('focus', handleFocus);

        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              // New version ready — SW will activate on next navigation
              console.log('[SW] New version available. Refresh to update.');
            }
          });
        });

        return () => window.removeEventListener('focus', handleFocus);
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    register();
  }, []);

  return null;
}

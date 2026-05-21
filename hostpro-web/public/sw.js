/**
 * HostPro Service Worker
 * Gere les push notifications et le cache offline
 */

const CACHE_NAME = 'hostpro-v1';
const STATIC_ASSETS = ['/manifest.json'];

// Installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nouveau message recu',
      icon: data.icon || '/hostpro-logo.svg',
      badge: data.badge || '/hostpro-logo.svg',
      tag: data.tag || 'hostpro-message',
      requireInteraction: data.requireInteraction !== false,
      data: { url: data.url || '/messages' },
      actions: data.actions || [
        { action: 'open', title: 'Ouvrir' },
        { action: 'dismiss', title: 'Ignorer' }
      ],
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'HostPro — Nouveau message', options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/messages';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('/messages') || client.url.endsWith('/')) {
          client.focus();
          return client.navigate(url);
        }
      }
      // Open new tab
      return clients.openWindow(url);
    })
  );
});

// Fermeture de notification
self.addEventListener('notificationclose', () => {
  console.log('[SW] Notification dismissed');
});

// Fetch — reseau d'abord, cache en fallback pour les assets statiques
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and API routes
  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) return;

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

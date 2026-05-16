/**
 * Service Worker pour HostPro
 * Gère les push notifications et le caching
 */

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  self.clients.claim();
});

// Écouter les push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nouveau message',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge-72.png',
      tag: data.tag || 'message-notification',
      requireInteraction: data.requireInteraction !== false,
      actions: data.actions || [
        { action: 'open', title: 'Ouvrir' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Nouveau message', options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }
});

// Cliquer sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Ouvrir la page des messages
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Si la page est déjà ouverte, la focus
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === '/' || clientList[i].url.includes('/messages')) {
            return clientList[i].focus();
          }
        }
        // Sinon, ouvrir une nouvelle window
        return clients.openWindow('/messages');
      })
    );
  }
});

// Détacher la notification
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Fetch para le caching offline (optionnel)
self.addEventListener('fetch', (event) => {
  // Pour l'instant, laisser naviguer normalement
  // À implémenter: cache-first / network-first strategies
});

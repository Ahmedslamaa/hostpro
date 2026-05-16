'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useWebPushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check browser support
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if (typeof window === 'undefined') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get VAPID key
      const vapidResponse = await api.get('/notifications/vapid-key');
      const vapidPublicKey = vapidResponse.data.publicKey;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to backend
      await api.post('/notifications/subscribe', subscription.toJSON());

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe to notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe
  };
}

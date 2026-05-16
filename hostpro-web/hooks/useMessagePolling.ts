'use client';

import { useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';

export function useMessagePolling(propertyId?: string) {
  const sync = useMessagesStore((state) => state.sync);

  useEffect(() => {
    // First sync immediately
    sync(propertyId);

    // Then poll every 5 minutes
    const interval = setInterval(() => {
      sync(propertyId);
    }, 5 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [propertyId, sync]);
}

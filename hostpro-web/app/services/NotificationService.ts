/**
 * Notification Service
 * Handles sending WebPush notifications to subscribed devices
 */

import webpush from 'web-push';
import { db } from '@/lib/db';

// Configure WebPush with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'support@hostpro.fr',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send notification to a specific user/tenant
   */
  static async sendToUser(
    tenantId: string,
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    try {
      // Get all subscriptions for this tenant
      const subscriptions = await (db.pushSubscription.findMany as any)({
        where: { tenant_id: tenantId }
      });

      if (subscriptions.length === 0) {
        return { success: 0, failed: 0 };
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        tag: payload.tag || 'notification',
        requireInteraction: payload.requireInteraction ?? true,
        actions: payload.actions || [],
        data: payload.data || {}
      });

      let successCount = 0;
      let failedCount = 0;

      // Send to each subscription with retry logic
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            notificationPayload
          );
          successCount++;
        } catch (error: any) {
          // Handle subscription expiry (410) and invalid subscriptions (404)
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Remove dead subscription
            await (db.pushSubscription.delete as any)({
              where: { endpoint: subscription.endpoint }
            }).catch(() => {});
          }
          failedCount++;
          console.error(
            `Failed to send notification to ${subscription.endpoint}:`,
            error.message
          );
        }
      }

      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('NotificationService.sendToUser error:', error);
      throw error;
    }
  }

  /**
   * Send notification when a new message arrives
   */
  static async notifyNewMessage(
    tenantId: string,
    senderName: string,
    messagePreview: string,
    threadId: string
  ): Promise<{ success: number; failed: number }> {
    return this.sendToUser(tenantId, {
      title: `Nouveau message de ${senderName}`,
      body: messagePreview.substring(0, 100),
      tag: `message-${threadId}`,
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'mute', title: 'Mettre en silence' }
      ],
      data: {
        threadId,
        action: 'open-message'
      }
    });
  }

  /**
   * Send notification for reservation events
   */
  static async notifyReservation(
    tenantId: string,
    eventType: 'check-in' | 'check-out' | 'new' | 'cancelled',
    guestName: string,
    propertyName: string
  ): Promise<{ success: number; failed: number }> {
    const titleMap = {
      'check-in': 'Arrivée',
      'check-out': 'Départ',
      'new': 'Nouvelle réservation',
      'cancelled': 'Réservation annulée'
    };

    return this.sendToUser(tenantId, {
      title: `${titleMap[eventType]}: ${propertyName}`,
      body: `${guestName}`,
      tag: `reservation-${eventType}`,
      data: {
        action: 'open-reservation',
        type: eventType
      }
    });
  }

  /**
   * Send notification for task reminders
   */
  static async notifyTaskReminder(
    tenantId: string,
    taskTitle: string,
    propertyName: string
  ): Promise<{ success: number; failed: number }> {
    return this.sendToUser(tenantId, {
      title: 'Rappel de tâche',
      body: `${taskTitle} - ${propertyName}`,
      tag: 'task-reminder',
      actions: [
        { action: 'complete', title: 'Marquer comme fait' }
      ]
    });
  }

  /**
   * Send daily summary notification
   */
  static async sendDailySummary(
    tenantId: string,
    messageCount: number,
    reservationCount: number,
    taskCount: number
  ): Promise<{ success: number; failed: number }> {
    const summary = [];
    if (messageCount > 0) summary.push(`${messageCount} message${messageCount > 1 ? 's' : ''}`);
    if (reservationCount > 0) summary.push(`${reservationCount} réservation${reservationCount > 1 ? 's' : ''}`);
    if (taskCount > 0) summary.push(`${taskCount} tâche${taskCount > 1 ? 's' : ''}`);

    if (summary.length === 0) {
      return { success: 0, failed: 0 };
    }

    return this.sendToUser(tenantId, {
      title: 'Résumé du jour',
      body: summary.join(', '),
      tag: 'daily-summary',
      requireInteraction: false
    });
  }
}

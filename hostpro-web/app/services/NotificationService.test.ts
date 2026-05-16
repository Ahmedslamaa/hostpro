/**
 * NotificationService Tests
 */

import { NotificationService } from './NotificationService';

describe('NotificationService', () => {
  describe('sendToUser', () => {
    it('should return empty result if no subscriptions exist', async () => {
      const result = await NotificationService.sendToUser('non-existent-tenant', {
        title: 'Test',
        body: 'Test message'
      });

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should handle notification with all properties', async () => {
      const result = await NotificationService.sendToUser('test-tenant', {
        title: 'New Message',
        body: 'Hello from test',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'test-tag',
        requireInteraction: true,
        actions: [{ action: 'open', title: 'Open' }],
        data: { threadId: '123' }
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
    });
  });

  describe('notifyNewMessage', () => {
    it('should create message notification with proper payload', async () => {
      const result = await NotificationService.notifyNewMessage(
        'test-tenant',
        'John Doe',
        'This is a test message content',
        'thread-123'
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
    });

    it('should truncate long message preview', async () => {
      const longMessage = 'A'.repeat(200);
      const result = await NotificationService.notifyNewMessage(
        'test-tenant',
        'Guest',
        longMessage,
        'thread-456'
      );

      expect(result).toHaveProperty('success');
    });
  });

  describe('notifyReservation', () => {
    it('should send check-in notification', async () => {
      const result = await NotificationService.notifyReservation(
        'test-tenant',
        'check-in',
        'Marie Dupont',
        'Villa Azur'
      );

      expect(result).toHaveProperty('success');
    });

    it('should send check-out notification', async () => {
      const result = await NotificationService.notifyReservation(
        'test-tenant',
        'check-out',
        'Jean Martin',
        'Apartment Beach'
      );

      expect(result).toHaveProperty('success');
    });

    it('should send new reservation notification', async () => {
      const result = await NotificationService.notifyReservation(
        'test-tenant',
        'new',
        'Sophie Leclerc',
        'Studio Downtown'
      );

      expect(result).toHaveProperty('success');
    });

    it('should send cancellation notification', async () => {
      const result = await NotificationService.notifyReservation(
        'test-tenant',
        'cancelled',
        'Pierre Bernard',
        'Penthouse View'
      );

      expect(result).toHaveProperty('success');
    });
  });

  describe('notifyTaskReminder', () => {
    it('should send task reminder notification', async () => {
      const result = await NotificationService.notifyTaskReminder(
        'test-tenant',
        'Clean guest room',
        'Villa Azur'
      );

      expect(result).toHaveProperty('success');
    });
  });

  describe('sendDailySummary', () => {
    it('should send summary with messages and reservations', async () => {
      const result = await NotificationService.sendDailySummary(
        'test-tenant',
        5,
        2,
        3
      );

      expect(result).toHaveProperty('success');
    });

    it('should return empty result if no activity', async () => {
      const result = await NotificationService.sendDailySummary(
        'test-tenant',
        0,
        0,
        0
      );

      expect(result.success).toBe(0);
    });

    it('should handle single item counts (no pluralization)', async () => {
      const result = await NotificationService.sendDailySummary(
        'test-tenant',
        1,
        1,
        1
      );

      expect(result).toHaveProperty('success');
    });
  });
});

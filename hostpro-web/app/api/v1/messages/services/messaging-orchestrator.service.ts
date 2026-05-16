/**
 * MessagingOrchestratorService
 * Service principal qui coordonne la synchronisation des messages
 * depuis toutes les plateformes (Airbnb, Booking, Abritel)
 */

import { PrismaClient } from '@prisma/client';
import { AirbnbMessagingService } from './airbnb.service';
import { BookingMessagingService } from './booking.service';
import { AbritelMessagingService } from './abritel.service';

export class MessagingOrchestratorService {
  constructor(
    private db: any, // PrismaClient - using any to avoid type generation issues
    private airbnb: AirbnbMessagingService,
    private booking: BookingMessagingService,
    private abritel: AbritelMessagingService
  ) {}

  /**
   * Synchronise les messages pour une propriété depuis TOUTES les plateformes
   */
  async syncPropertyMessages(tenantId: string, propertyId: string) {
    const integrations = await this.db.platformIntegration.findMany({
      where: { tenant_id: tenantId, status: 'active' }
    });

    const results = {
      imported: 0,
      errors: [] as string[],
      timestamp: new Date()
    };

    for (const integration of integrations) {
      try {
        switch (integration.platform) {
          case 'airbnb':
            await this.syncAirbnbMessages(integration, propertyId);
            results.imported++;
            break;
          case 'booking':
            await this.syncBookingMessages(integration, propertyId);
            results.imported++;
            break;
          case 'abritel':
            await this.syncAbritelMessages(integration, propertyId);
            results.imported++;
            break;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${integration.platform}: ${errorMsg}`);

        // Mettre à jour le status d'erreur
        await this.db.platformIntegration.update({
          where: { id: integration.id },
          data: {
            sync_error: errorMsg,
            status: 'error'
          }
        });
      }
    }

    return results;
  }

  /**
   * Envoyer une réponse unifiée (sur toutes les plateformes)
   */
  async sendReply(threadId: string, message: string, hostName: string = 'Propriétaire') {
    const thread = await this.db.messageThread.findUnique({
      where: { id: threadId },
      include: { platformIntegration: true }
    });

    if (!thread) throw new Error('Thread not found');
    if (!thread.platformIntegration) throw new Error('No platform integration found');

    // Déparser les platform_thread_ids (JSON)
    const platformIds = JSON.parse(thread.platform_thread_ids);

    const sentResults: Record<string, boolean> = {};

    // Envoyer sur chaque plateforme
    for (const [platform, externalThreadId] of Object.entries(platformIds)) {
      try {
        let messageId: string | null = null;
        let sentAt: Date = new Date();

        if (platform === 'airbnb' && thread.platformIntegration.api_key) {
          const airbnbService = new AirbnbMessagingService(thread.platformIntegration.api_key);
          const result = await airbnbService.sendMessage(
            externalThreadId as string,
            message
          );
          messageId = result.messageId;
          sentAt = result.sentAt;
        } else if (platform === 'booking' && thread.platformIntegration.oauth_token) {
          const bookingService = new BookingMessagingService(thread.platformIntegration.oauth_token);
          const result = await bookingService.sendMessage(
            externalThreadId as string,
            message
          );
          messageId = result.messageId;
          sentAt = result.sentAt;
        } else if (platform === 'abritel' && thread.platformIntegration.api_key) {
          const abritelService = new AbritelMessagingService(thread.platformIntegration.api_key);
          const result = await abritelService.sendMessage(
            externalThreadId as string,
            message
          );
          messageId = result.messageId;
          sentAt = result.sentAt;
        }

        if (messageId) {
          // Créer entrée Message locale
          await this.db.message.create({
            data: {
              thread_id: threadId,
              platform: platform as string,
              platform_message_id: messageId,
              sender: 'host',
              sender_name: hostName,
              body: message,
              sent_at: sentAt,
              synced_to: JSON.stringify({ [platform]: true })
            }
          });

          sentResults[platform] = true;
        }
      } catch (error) {
        console.error(`Failed to send on ${platform}:`, error);
        sentResults[platform] = false;
      }
    }

    // Mettre à jour last_message_at du thread
    await this.db.messageThread.update({
      where: { id: threadId },
      data: { last_message_at: new Date() }
    });

    return sentResults;
  }

  /**
   * Synchroniser les messages depuis Airbnb
   */
  private async syncAirbnbMessages(integration: any, propertyId: string) {
    if (!integration.api_key) {
      throw new Error('Airbnb API key not configured');
    }

    const airbnbService = new AirbnbMessagingService(integration.api_key);
    const conversations = await airbnbService.fetchConversations(propertyId);

    for (const conv of conversations) {
      // Créer ou mettre à jour thread
      let thread = await this.db.messageThread.findFirst({
        where: {
          tenant_id: integration.tenant_id,
          platform_thread_ids: { contains: conv.threadId }
        }
      });

      if (!thread) {
        thread = await this.db.messageThread.create({
          data: {
            tenant_id: integration.tenant_id,
            property_id: propertyId,
            guest_name: conv.guestName,
            guest_email: conv.guestEmail,
            platform_thread_ids: JSON.stringify({ airbnb: conv.threadId }),
            platform_integration_id: integration.id,
            last_message_at: conv.lastMessageAt
          }
        });
      } else {
        // Mettre à jour le thread ID si nécessaire
        const threadIds = JSON.parse(thread.platform_thread_ids);
        if (!threadIds.airbnb) {
          threadIds.airbnb = conv.threadId;
          await this.db.messageThread.update({
            where: { id: thread.id },
            data: { platform_thread_ids: JSON.stringify(threadIds) }
          });
        }
      }

      // Récupérer les messages
      const messages = await airbnbService.fetchMessages(conv.threadId);

      for (const msg of messages) {
        // Déduplifier par platform_message_id
        const existing = await this.db.message.findFirst({
          where: {
            thread_id: thread.id,
            platform_message_id: msg.platformId
          }
        });

        if (!existing) {
          await this.db.message.create({
            data: {
              thread_id: thread.id,
              platform: 'airbnb',
              platform_message_id: msg.platformId,
              sender: msg.sender === 'host' ? 'host' : 'guest',
              sender_name: msg.senderName,
              body: msg.body,
              sent_at: msg.sentAt,
              synced_to: JSON.stringify({ airbnb: true })
            }
          });

          // Incrémenter le compteur de non-lus si c'est un message invité
          if (msg.sender === 'guest') {
            await this.db.messageThread.update({
              where: { id: thread.id },
              data: {
                unread_count: { increment: 1 },
                last_message_at: msg.sentAt
              }
            });
          }
        }
      }
    }
  }

  /**
   * Synchroniser les messages depuis Booking
   */
  private async syncBookingMessages(integration: any, propertyId: string) {
    if (!integration.oauth_token) {
      throw new Error('Booking OAuth token not configured');
    }

    const bookingService = new BookingMessagingService(integration.oauth_token);
    const conversations = await bookingService.fetchConversations(propertyId);

    // Same logic as Airbnb
    for (const conv of conversations) {
      let thread = await this.db.messageThread.findFirst({
        where: {
          tenant_id: integration.tenant_id,
          platform_thread_ids: { contains: conv.threadId }
        }
      });

      if (!thread) {
        thread = await this.db.messageThread.create({
          data: {
            tenant_id: integration.tenant_id,
            property_id: propertyId,
            guest_name: conv.guestName,
            guest_email: conv.guestEmail,
            platform_thread_ids: JSON.stringify({ booking: conv.threadId }),
            platform_integration_id: integration.id,
            last_message_at: conv.lastMessageAt
          }
        });
      }

      const messages = await bookingService.fetchMessages(conv.threadId);

      for (const msg of messages) {
        const existing = await this.db.message.findFirst({
          where: {
            thread_id: thread.id,
            platform_message_id: msg.platformId
          }
        });

        if (!existing) {
          await this.db.message.create({
            data: {
              thread_id: thread.id,
              platform: 'booking',
              platform_message_id: msg.platformId,
              sender: msg.sender === 'host' ? 'host' : 'guest',
              sender_name: msg.senderName,
              body: msg.body,
              sent_at: msg.sentAt,
              synced_to: JSON.stringify({ booking: true })
            }
          });

          if (msg.sender === 'guest') {
            await this.db.messageThread.update({
              where: { id: thread.id },
              data: {
                unread_count: { increment: 1 },
                last_message_at: msg.sentAt
              }
            });
          }
        }
      }
    }
  }

  /**
   * Synchroniser les messages depuis Abritel
   */
  private async syncAbritelMessages(integration: any, propertyId: string) {
    if (!integration.api_key) {
      throw new Error('Abritel API key not configured');
    }

    const abritelService = new AbritelMessagingService(integration.api_key);
    const conversations = await abritelService.fetchConversations(propertyId);

    for (const conv of conversations) {
      let thread = await this.db.messageThread.findFirst({
        where: {
          tenant_id: integration.tenant_id,
          platform_thread_ids: { contains: conv.threadId }
        }
      });

      if (!thread) {
        thread = await this.db.messageThread.create({
          data: {
            tenant_id: integration.tenant_id,
            property_id: propertyId,
            guest_name: conv.guestName,
            guest_email: conv.guestEmail,
            platform_thread_ids: JSON.stringify({ abritel: conv.threadId }),
            platform_integration_id: integration.id,
            last_message_at: conv.lastMessageAt
          }
        });
      }

      const messages = await abritelService.fetchMessages(conv.threadId);

      for (const msg of messages) {
        const existing = await this.db.message.findFirst({
          where: {
            thread_id: thread.id,
            platform_message_id: msg.platformId
          }
        });

        if (!existing) {
          await this.db.message.create({
            data: {
              thread_id: thread.id,
              platform: 'abritel',
              platform_message_id: msg.platformId,
              sender: msg.sender === 'host' ? 'host' : 'guest',
              sender_name: msg.senderName,
              body: msg.body,
              sent_at: msg.sentAt,
              synced_to: JSON.stringify({ abritel: true })
            }
          });

          if (msg.sender === 'guest') {
            await this.db.messageThread.update({
              where: { id: thread.id },
              data: {
                unread_count: { increment: 1 },
                last_message_at: msg.sentAt
              }
            });
          }
        }
      }
    }
  }

  /**
   * Marquer un message comme lu
   */
  async markAsRead(messageId: string) {
    const message = await this.db.message.update({
      where: { id: messageId },
      data: { is_read: true, read_at: new Date() }
    });

    // Décr démenter le compteur non-lu si pertinent
    if (!message.is_read) {
      await this.db.messageThread.update({
        where: { id: message.thread_id },
        data: { unread_count: { decrement: 1 } }
      });
    }

    return message;
  }

  /**
   * Marquer tous les messages d'un thread comme lus
   */
  async markThreadAsRead(threadId: string) {
    const messages = await this.db.message.updateMany({
      where: { thread_id: threadId, is_read: false },
      data: { is_read: true, read_at: new Date() }
    });

    await this.db.messageThread.update({
      where: { id: threadId },
      data: { unread_count: 0 }
    });

    return messages;
  }
}

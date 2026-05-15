/**
 * AirbnbMessagingService
 * Gère la communication avec l'API Airbnb pour les messages
 */

import axios, { AxiosInstance } from 'axios';

interface Conversation {
  threadId: string;
  guestName: string;
  guestEmail?: string;
  lastMessageAt: Date;
  subject?: string;
}

interface Message {
  messageId: string;
  platformId: string;
  sender: 'host' | 'guest';
  senderName: string;
  body: string;
  sentAt: Date;
}

interface SendResult {
  messageId: string;
  sentAt: Date;
}

export class AirbnbMessagingService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.airbnb.com/v2';
  private timeout = 10000;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Airbnb-API-Lib': 'hostpro-unified-messaging'
      },
      timeout: this.timeout
    });
  }

  /**
   * Récupère les conversations pour une propriété
   */
  async fetchConversations(propertyId: string): Promise<Conversation[]> {
    try {
      const response = await this.client.get('/conversations', {
        params: {
          listing_id: propertyId,
          role: 'host',
          limit: 100
        }
      });

      if (!response.data?.conversations) {
        return [];
      }

      return response.data.conversations
        .filter((conv: any) => conv.id && conv.guest_name)
        .map((conv: any) => ({
          threadId: conv.id,
          guestName: conv.guest_name || 'Guest',
          guestEmail: conv.guest_email || undefined,
          lastMessageAt: conv.updated_at ? new Date(conv.updated_at) : new Date(),
          subject: conv.last_message?.body?.slice(0, 100) || undefined
        }));
    } catch (error) {
      console.error('Airbnb fetchConversations error:', error);
      throw new Error(
        `Airbnb sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  async fetchMessages(threadId: string): Promise<Message[]> {
    try {
      const response = await this.client.get(`/conversations/${threadId}/messages`, {
        params: {
          limit: 100,
          include_deleted: false
        }
      });

      if (!response.data?.messages) {
        return [];
      }

      return response.data.messages
        .filter((msg: any) => msg.id && msg.body)
        .map((msg: any) => ({
          messageId: msg.id,
          platformId: msg.id,
          sender: msg.created_by_role === 'host' ? 'host' : 'guest',
          senderName: msg.created_by_name || (msg.created_by_role === 'host' ? 'Host' : 'Guest'),
          body: msg.body,
          sentAt: msg.created_at ? new Date(msg.created_at) : new Date()
        }));
    } catch (error) {
      console.error('Airbnb fetchMessages error:', error);
      throw new Error(
        `Failed to fetch Airbnb messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Envoie un message
   */
  async sendMessage(threadId: string, message: string): Promise<SendResult> {
    try {
      const response = await this.client.post(`/conversations/${threadId}/messages`, {
        message
      });

      if (!response.data?.message?.id) {
        throw new Error('No message ID returned from Airbnb');
      }

      return {
        messageId: response.data.message.id,
        sentAt: response.data.message.created_at
          ? new Date(response.data.message.created_at)
          : new Date()
      };
    } catch (error) {
      console.error('Airbnb sendMessage error:', error);
      throw new Error(
        `Failed to send Airbnb message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

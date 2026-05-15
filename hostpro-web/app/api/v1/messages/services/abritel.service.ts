/**
 * AbritelMessagingService
 * Gère la communication avec l'API Abritel/Vrbo pour les messages
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

export class AbritelMessagingService {
  private client: AxiosInstance;
  private baseUrl = 'https://www.abritel.fr/api/v2';
  private timeout = 10000;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
        'X-Abritel-API-Lib': 'hostpro-unified-messaging'
      },
      timeout: this.timeout
    });
  }

  /**
   * Récupère les conversations pour une propriété
   */
  async fetchConversations(propertyId: string): Promise<Conversation[]> {
    try {
      const response = await this.client.get('/messages/conversations', {
        params: {
          property_id: propertyId,
          limit: 100,
          status: 'all'
        }
      });

      if (!response.data?.data) {
        return [];
      }

      return response.data.data
        .filter((conv: any) => conv.id && conv.guest_name)
        .map((conv: any) => ({
          threadId: conv.id,
          guestName: conv.guest_name || 'Guest',
          guestEmail: conv.guest_email || undefined,
          lastMessageAt: conv.last_message_at ? new Date(conv.last_message_at) : new Date(),
          subject: conv.subject || undefined
        }));
    } catch (error) {
      console.error('Abritel fetchConversations error:', error);
      throw new Error(
        `Abritel sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await this.client.get(`/messages/conversations/${conversationId}/messages`, {
        params: {
          limit: 100,
          sort_by: 'created_at',
          sort_order: 'asc'
        }
      });

      if (!response.data?.data) {
        return [];
      }

      return response.data.data
        .filter((msg: any) => msg.id && msg.body)
        .map((msg: any) => ({
          messageId: msg.id,
          platformId: msg.id,
          sender: msg.sender_type === 'host' ? 'host' : 'guest',
          senderName: msg.sender_name || (msg.sender_type === 'host' ? 'Host' : 'Guest'),
          body: msg.body,
          sentAt: msg.created_at ? new Date(msg.created_at) : new Date()
        }));
    } catch (error) {
      console.error('Abritel fetchMessages error:', error);
      throw new Error(
        `Failed to fetch Abritel messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Envoie un message
   */
  async sendMessage(conversationId: string, message: string): Promise<SendResult> {
    try {
      const response = await this.client.post(
        `/messages/conversations/${conversationId}/messages`,
        { body: message }
      );

      if (!response.data?.data?.id) {
        throw new Error('No message ID returned from Abritel');
      }

      return {
        messageId: response.data.data.id,
        sentAt: response.data.data.created_at
          ? new Date(response.data.data.created_at)
          : new Date()
      };
    } catch (error) {
      console.error('Abritel sendMessage error:', error);
      throw new Error(
        `Failed to send Abritel message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

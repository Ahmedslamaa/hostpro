/**
 * BookingMessagingService
 * Gère la communication avec l'API Booking.com pour les messages
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

export class BookingMessagingService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.booking.com/v2';
  private timeout = 10000;

  constructor(oauthToken: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Accept': 'application/json',
        'X-Booking-API-Lib': 'hostpro-unified-messaging'
      },
      timeout: this.timeout
    });
  }

  /**
   * Récupère les conversations pour une propriété
   */
  async fetchConversations(propertyId: string): Promise<Conversation[]> {
    try {
      // Booking API endpoint pour les conversations
      const response = await this.client.get('/conversations', {
        params: {
          listing_id: propertyId,
          limit: 100,
          sort: '-updated'
        }
      });

      if (!response.data?.results) {
        return [];
      }

      return response.data.results
        .filter((conv: any) => conv.id && conv.guest_name)
        .map((conv: any) => ({
          threadId: conv.id,
          guestName: conv.guest_name || 'Guest',
          guestEmail: conv.guest_email || undefined,
          lastMessageAt: conv.last_message_date ? new Date(conv.last_message_date) : new Date(),
          subject: conv.latest_message_preview?.slice(0, 100) || undefined
        }));
    } catch (error) {
      console.error('Booking fetchConversations error:', error);
      throw new Error(
        `Booking sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await this.client.get(`/conversations/${conversationId}/messages`, {
        params: {
          limit: 100,
          sort: 'created_asc'
        }
      });

      if (!response.data?.results) {
        return [];
      }

      return response.data.results
        .filter((msg: any) => msg.id && msg.message)
        .map((msg: any) => ({
          messageId: msg.id,
          platformId: msg.id,
          sender: msg.is_from_property_manager ? 'host' : 'guest',
          senderName: msg.sender_name || (msg.is_from_property_manager ? 'Property Manager' : 'Guest'),
          body: msg.message,
          sentAt: msg.created_at ? new Date(msg.created_at) : new Date()
        }));
    } catch (error) {
      console.error('Booking fetchMessages error:', error);
      throw new Error(
        `Failed to fetch Booking messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Envoie un message
   */
  async sendMessage(conversationId: string, message: string): Promise<SendResult> {
    try {
      const response = await this.client.post(`/conversations/${conversationId}/messages`, {
        message
      });

      if (!response.data?.message?.id) {
        throw new Error('No message ID returned from Booking');
      }

      return {
        messageId: response.data.message.id,
        sentAt: response.data.message.created_at
          ? new Date(response.data.message.created_at)
          : new Date()
      };
    } catch (error) {
      console.error('Booking sendMessage error:', error);
      throw new Error(
        `Failed to send Booking message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

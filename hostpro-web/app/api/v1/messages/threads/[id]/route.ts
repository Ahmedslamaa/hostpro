/**
 * GET /api/v1/messages/threads/[id]
 * Récupérer une conversation spécifique avec tous ses messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    // Recuperer le thread avec tous ses messages
    // @ts-ignore - Prisma types not fully generated
    const thread: any = await (db.messageThread.findUnique as any)({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { sent_at: 'asc' }
        }
      }
    });

    if (!thread || thread.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Format response
    const threadIds = JSON.parse(thread.platform_thread_ids || '{}');
    const platform = Object.keys(threadIds)[0] || 'direct';

    const formattedThread = {
      id: thread.id,
      guestName: thread.guest_name,
      guestEmail: thread.guest_email,
      platform: platform,
      platformIds: threadIds,
      unreadCount: thread.unread_count,
      status: thread.status,
      lastMessageAt: thread.last_message_at?.toISOString() || null,
      createdAt: thread.created_at?.toISOString() || null,
      messages: thread.messages.map((msg: any) => ({
        id: msg.id,
        body: msg.body,
        sender: msg.sender,
        senderName: msg.sender_name,
        platform: msg.platform,
        sentAt: msg.sent_at?.toISOString() || null,
        isRead: msg.is_read,
        readAt: msg.read_at?.toISOString() || null
      }))
    };

    return NextResponse.json(formattedThread);
  } catch (error) {
    console.error('GET /api/v1/messages/threads/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

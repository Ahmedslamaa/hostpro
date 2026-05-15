/**
 * GET /api/v1/messages/threads
 * Lister les conversations avec filtrage et pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    const propertyId = searchParams.get('property_id');
    const status = searchParams.get('status') || 'open';
    const platformFilter = searchParams.get('platform');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const searchQuery = searchParams.get('search') || '';

    // Construire le filtre
    const where: any = {
      tenant_id: tenantId,
      status
    };

    if (propertyId) {
      where.property_id = propertyId;
    }

    if (searchQuery) {
      where.OR = [
        { guest_name: { contains: searchQuery, mode: 'insensitive' } },
        { guest_email: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    if (platformFilter) {
      where.platformIntegration = { platform: platformFilter };
    }

    // Récupérer le total pour la pagination
    const total = await db.messageThread.count({ where });

    // Récupérer les threads
    const threads = await db.messageThread.findMany({
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { sent_at: 'desc' }
        },
        platformIntegration: true
      },
      orderBy: { last_message_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Formater la réponse
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      guestName: thread.guest_name,
      guestEmail: thread.guest_email,
      platform: thread.platformIntegration?.platform || 'direct',
      unreadCount: thread.unread_count,
      lastMessageAt: thread.last_message_at?.toISOString() || null,
      preview: thread.messages[0]?.body?.slice(0, 100) || '',
      status: thread.status
    }));

    return NextResponse.json({
      threads: formattedThreads,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('GET /api/v1/messages/threads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

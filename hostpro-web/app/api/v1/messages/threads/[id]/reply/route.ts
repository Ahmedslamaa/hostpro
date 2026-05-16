/**
 * POST /api/v1/messages/threads/[id]/reply
 * Envoyer une réponse unifiée sur toutes les plateformes
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MessagingOrchestratorService } from '../../../services/messaging-orchestrator.service';
import { AirbnbMessagingService } from '../../../services/airbnb.service';
import { BookingMessagingService } from '../../../services/booking.service';
import { AbritelMessagingService } from '../../../services/abritel.service';

const db = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    const userId = req.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: 'Missing required headers (x-tenant-id, x-user-id)' },
        { status: 400 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Recuperer le thread
    const thread = await db.messageThread.findUnique({
      where: { id: params.id },
      // @ts-ignore - Prisma types not fully generated
      include: { platformIntegration: true }
    });

    if (!thread || thread.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Recuperer le host name (proprietaire)
    // @ts-ignore - Prisma types not fully generated
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { full_name: true }
    });

    const hostName = user?.full_name || 'Proprietaire';

    // Initialiser les services
    const airbnbService = new AirbnbMessagingService('');
    const bookingService = new BookingMessagingService('');
    const abritelService = new AbritelMessagingService('');

    const orchestrator = new MessagingOrchestratorService(
      db,
      airbnbService,
      bookingService,
      abritelService
    );

    // Envoyer le message sur toutes les plateformes
    const sentResults = await orchestrator.sendReply(
      params.id,
      message.trim(),
      hostName
    );

    // Vérifier que le message a été envoyé sur au moins une plateforme
    const successCount = Object.values(sentResults).filter(Boolean).length;
    if (successCount === 0) {
      return NextResponse.json(
        { error: 'Failed to send message on all platforms' },
        { status: 500 }
      );
    }

    // Retourner le résultat
    return NextResponse.json({
      success: true,
      threadId: params.id,
      sentResults,
      successCount,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('POST /api/v1/messages/threads/[id]/reply error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

/**
 * PUT /api/v1/messages/threads/[id]/reply
 * Mark message thread as read
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = req.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    // Récupérer le thread
    const thread = await db.messageThread.findUnique({
      where: { id: params.id }
    });

    if (!thread || thread.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Marquer tous les messages du thread comme lus
    // @ts-ignore - Prisma types not fully generated
    await db.message.updateMany({
      where: { thread_id: params.id },
      data: { is_read: true, read_at: new Date() }
    } as any);

    // Reinitialiser le compteur de non-lus
    // @ts-ignore - Prisma types not fully generated
    await db.messageThread.update({
      where: { id: params.id },
      data: { unread_count: 0 }
    } as any);

    return NextResponse.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('PUT /api/v1/messages/threads/[id]/reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

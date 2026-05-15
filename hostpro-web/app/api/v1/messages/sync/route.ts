/**
 * POST /api/v1/messages/sync
 * Déclencher la synchronisation des messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MessagingOrchestratorService } from '../services/messaging-orchestrator.service';
import { AirbnbMessagingService } from '../services/airbnb.service';
import { BookingMessagingService } from '../services/booking.service';
import { AbritelMessagingService } from '../services/abritel.service';

const db = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      );
    }

    // Créer les services
    const airbnb = new AirbnbMessagingService('');
    const booking = new BookingMessagingService('');
    const abritel = new AbritelMessagingService('');

    // Créer l'orchestrator
    const orchestrator = new MessagingOrchestratorService(db, airbnb, booking, abritel);

    // Déclencher la synchronisation
    const result = await orchestrator.syncPropertyMessages(tenantId, propertyId);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('POST /api/v1/messages/sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

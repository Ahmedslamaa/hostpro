/**
 * POST /api/v1/notifications/subscribe
 * Register device for push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    const userId = req.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: 'Missing required headers (x-tenant-id, x-user-id)' },
        { status: 400 }
      );
    }

    const subscription = await req.json();

    if (!subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Upsert subscription
    const result = await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      create: {
        tenant_id: tenantId,
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    return NextResponse.json({
      success: true,
      subscription: result
    });
  } catch (error) {
    console.error('POST /api/v1/notifications/subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

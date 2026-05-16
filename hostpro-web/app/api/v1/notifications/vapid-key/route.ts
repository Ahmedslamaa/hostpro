/**
 * GET /api/v1/notifications/vapid-key
 * Return VAPID public key for WebPush subscription
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      return NextResponse.json(
        { error: 'VAPID public key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publicKey: vapidPublicKey
    });
  } catch (error) {
    console.error('GET /api/v1/notifications/vapid-key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

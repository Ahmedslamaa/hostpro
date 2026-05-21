export const dynamic = "force-dynamic";
/**
 * POST /api/v1/notifications/send
 * Send push notification to all subscribers of a tenant
 * Called internally after a new guest message arrives
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/push';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    const { title, body, threadId, guestName } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'title and body are required' },
        { status: 400 }
      );
    }

    // Get all admin users for this tenant
    const userTenants = await db.userTenant.findMany({
      where: { tenant_id: tenantId, role: 'admin', is_active: true },
      select: { user_id: true }
    });

    if (!userTenants.length) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Send push to each admin
    let sent = 0;
    await Promise.allSettled(
      userTenants.map(async ({ user_id }) => {
        try {
          await sendPushToUser(
            user_id,
            title || `Message de ${guestName || 'un voyageur'}`,
            body,
            threadId ? `/messages?thread=${threadId}` : '/messages'
          );
          sent++;
        } catch (err) {
          console.error(`Push failed for user ${user_id}:`, err);
        }
      })
    );

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('POST /api/v1/notifications/send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

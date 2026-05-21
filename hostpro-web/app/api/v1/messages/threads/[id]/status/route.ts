export const dynamic = "force-dynamic";
/**
 * PATCH /api/v1/messages/threads/[id]/status
 * Update thread status: open | closed | archived
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const VALID_STATUSES = ['open', 'closed', 'archived'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing x-tenant-id header' },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify thread belongs to this tenant
    const thread = await (db.messageThread.findUnique as any)({
      where: { id: params.id },
      select: { id: true, tenant_id: true }
    });

    if (!thread || thread.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Update status
    const updated = await (db.messageThread.update as any)({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true }
    });

    return NextResponse.json({
      success: true,
      thread: updated
    });
  } catch (error) {
    console.error('PATCH /api/v1/messages/threads/[id]/status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

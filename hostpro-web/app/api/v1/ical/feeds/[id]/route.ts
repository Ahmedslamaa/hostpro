import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const feed = await db.icalFeed.findUnique({
    where: { id: params.id },
    include: { property: { select: { tenant_id: true } } },
  });

  if (!feed) return NextResponse.json({ error: "Feed introuvable" }, { status: 404 });
  if (feed.property.tenant_id !== auth.tenant_id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await db.icalFeed.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const feed = await db.icalFeed.findUnique({
    where: { id: params.id },
    include: { property: { select: { id: true, name: true, tenant_id: true } } },
  });

  if (!feed) return NextResponse.json({ error: "Feed introuvable" }, { status: 404 });
  if (feed.property.tenant_id !== auth.tenant_id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json(feed);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const feed = await db.icalFeed.findUnique({
    where: { id: params.id },
    include: { property: { select: { tenant_id: true } } },
  });

  if (!feed) return NextResponse.json({ error: "Feed introuvable" }, { status: 404 });
  if (feed.property.tenant_id !== auth.tenant_id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const data = await req.json();
  const updated = await db.icalFeed.update({
    where: { id: params.id },
    data: {
      ...(data.url       !== undefined ? { url: data.url }             : {}),
      ...(data.platform  !== undefined ? { platform: data.platform }   : {}),
      ...(data.direction !== undefined ? { direction: data.direction } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    },
  });

  return NextResponse.json(updated);
}

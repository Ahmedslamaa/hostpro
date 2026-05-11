import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const property_id = searchParams.get("property_id");

  const feeds = await db.icalFeed.findMany({
    where: {
      property: { tenant_id: tenantId },
      ...(property_id ? { property_id } : {}),
    },
    include: { property: { select: { id: true, name: true } } },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(feeds);
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { property_id, platform, url, direction } = await req.json();
  if (!property_id || !platform || !url) {
    return NextResponse.json({ error: "property_id, platform et url requis" }, { status: 400 });
  }

  const feed = await db.icalFeed.create({
    data: { property_id, platform, url, direction: direction ?? "import", is_active: true },
  });
  return NextResponse.json(feed, { status: 201 });
}

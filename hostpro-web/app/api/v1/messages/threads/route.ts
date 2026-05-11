import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const threads = await db.messageThread.findMany({
    where: { tenant_id: tenantId },
    include: { messages: { orderBy: { created_at: "desc" }, take: 1 } },
    orderBy: { updated_at: "desc" },
  });

  return NextResponse.json(threads);
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const data = await req.json();
  const thread = await db.messageThread.create({
    data: {
      tenant_id: tenantId,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      property_id: data.property_id,
      platform: data.platform ?? "direct",
    },
  });
  return NextResponse.json(thread, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start") ?? new Date().toISOString().slice(0, 10);
  const end = searchParams.get("end") ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const property_ids = searchParams.get("property_ids")?.split(",").filter(Boolean);

  const reservations = await db.reservation.findMany({
    where: {
      tenant_id: tenantId,
      check_in: { lte: end },
      check_out: { gte: start },
      status: { in: ["confirmed", "pending"] },
      ...(property_ids?.length ? { property_id: { in: property_ids } } : {}),
    },
    include: { property: { select: { id: true, name: true } } },
  });

  const events = reservations.map((r) => ({
    id: r.id,
    title: `${r.guest_name} — ${r.property.name}`,
    start: r.check_in,
    end: r.check_out,
    property_id: r.property_id,
    property_name: r.property.name,
    status: r.status,
    source: r.source,
    nights: r.nights,
    total_amount: r.total_amount,
  }));

  return NextResponse.json(events);
}

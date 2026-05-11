import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const today = new Date().toISOString().slice(0, 10);
  const inWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const arrivals = await db.reservation.findMany({
    where: { tenant_id: tenantId, check_in: { gte: today, lte: inWeek }, status: { in: ["confirmed", "pending"] } },
    include: { property: { select: { name: true } } },
    orderBy: { check_in: "asc" },
    take: 10,
  });

  const departures = await db.reservation.findMany({
    where: { tenant_id: tenantId, check_out: { gte: today, lte: inWeek }, status: "confirmed" },
    include: { property: { select: { name: true } } },
    orderBy: { check_out: "asc" },
    take: 10,
  });

  return NextResponse.json({ arrivals, departures });
}

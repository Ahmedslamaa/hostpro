import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const days = parseInt(searchParams.get("days") ?? "14");

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

  const arrivals = await db.reservation.findMany({
    where: { tenant_id: tenantId, check_in: { gte: today, lte: horizon }, status: { in: ["confirmed", "pending"] } },
    include: { property: { select: { id: true, name: true } } },
    orderBy: { check_in: "asc" },
    take: 20,
  });

  // Flatten to match UI expectations: property_name at top level
  const normalized = arrivals.map((r) => ({
    ...r,
    reservation_id: r.id,
    property_name: r.property?.name ?? "",
    property: undefined,
  }));

  return NextResponse.json(normalized);
}

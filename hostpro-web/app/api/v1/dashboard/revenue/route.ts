import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const months = parseInt(req.nextUrl.searchParams.get("months") ?? "6");
  const now = new Date();

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = date.toISOString().slice(0, 10);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);

    const reservations = await db.reservation.findMany({
      where: { tenant_id: tenantId, check_in: { gte: start, lte: end }, status: { not: "cancelled" } },
      select: { total_amount: true, nights: true },
    });

    const revenue = reservations.reduce((s, r) => s + (r.total_amount ?? 0), 0);
    const nights  = reservations.reduce((s, r) => s + r.nights, 0);

    result.push({
      month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: Math.round(revenue),
      reservations: reservations.length,
      nights,
    });
  }

  return NextResponse.json(result);
}

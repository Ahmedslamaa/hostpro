import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [properties, reservations, tasks] = await Promise.all([
    db.property.findMany({ where: { tenant_id: tenantId } }),
    db.reservation.findMany({
      where: { tenant_id: tenantId, check_in: { gte: startOfMonth, lte: endOfMonth } },
    }),
    db.task.count({ where: { tenant_id: tenantId, status: { not: "done" } } }),
  ]);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalNights = properties.length * daysInMonth;

  const occupiedNights = reservations.reduce((sum, r) => sum + r.nights, 0);
  const occupancyRate = totalNights > 0 ? Math.round((occupiedNights / totalNights) * 100) : 0;
  const revenue = reservations.reduce((sum, r) => sum + (r.total_amount ?? 0), 0);
  const avgPricePerNight = occupiedNights > 0 ? revenue / occupiedNights : 0;
  const revPAR = totalNights > 0 ? revenue / totalNights : 0;

  return NextResponse.json({
    occupancy_rate: occupancyRate,
    revenue: revenue,
    avg_price_per_night: Math.round(avgPricePerNight * 100) / 100,
    rev_par: Math.round(revPAR * 100) / 100,
    total_reservations: reservations.length,
    active_properties: properties.filter((p) => p.status === "active").length,
    total_properties: properties.length,
    pending_tasks: tasks,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const records = await db.complianceRecord.findMany({
    where: { property: { tenant_id: tenantId } },
    include: { property: { select: { id: true, name: true, city: true } } },
  });

  return NextResponse.json(
    records.map((r) => ({
      ...r,
      alerts: JSON.parse(r.alerts || "[]"),
    }))
  );
}

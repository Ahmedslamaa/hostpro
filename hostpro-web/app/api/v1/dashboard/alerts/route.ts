import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const compliances = await db.complianceRecord.findMany({
    where: { property: { tenant_id: tenantId }, is_compliant: false },
    include: { property: { select: { name: true } } },
  });

  const alerts = compliances.flatMap((c) => {
    const rawAlerts = JSON.parse(c.alerts || "[]") as string[];
    return rawAlerts.map((msg) => ({
      property_name: c.property.name,
      message: msg,
      severity: msg.includes("Plafond") || msg.includes("manquant") ? "critical" : "warning",
    }));
  });

  return NextResponse.json(alerts);
}

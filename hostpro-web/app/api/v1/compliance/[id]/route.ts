import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const record = await db.complianceRecord.findUnique({
    where: { property_id: params.id },
    include: { property: { select: { id: true, name: true } } },
  });
  if (!record) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({ ...record, alerts: JSON.parse(record.alerts || "[]") });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const data = await req.json();

  // Recalcul conformité
  const nuitees = data.nuitees_year ?? 0;
  const limit = data.nuitees_limit ?? 120;
  const alerts: string[] = [];
  if (!data.registration_number) alerts.push("Numéro d'enregistrement manquant");
  if (data.dpe_class === "E" || data.dpe_class === "F" || data.dpe_class === "G")
    alerts.push(`DPE classe ${data.dpe_class} — mise à niveau recommandée`);
  if (nuitees >= limit) alerts.push("Plafond de nuitées atteint");
  else if (nuitees >= (data.nuitees_alert_at ?? 96)) alerts.push("Seuil d'alerte nuitées approché");

  const record = await db.complianceRecord.update({
    where: { property_id: params.id },
    data: {
      registration_number: data.registration_number,
      registration_city: data.registration_city,
      registration_expiry: data.registration_expiry,
      nuitees_year: data.nuitees_year,
      nuitees_limit: data.nuitees_limit,
      nuitees_alert_at: data.nuitees_alert_at,
      dpe_class: data.dpe_class,
      dpe_expiry: data.dpe_expiry,
      fiscal_regime: data.fiscal_regime,
      siret: data.siret,
      is_compliant: alerts.length === 0,
      alerts: JSON.stringify(alerts),
    },
  });

  return NextResponse.json({ ...record, alerts });
}

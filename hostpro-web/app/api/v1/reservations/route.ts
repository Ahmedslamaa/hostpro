import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const property_id = searchParams.get("property_id");

  const reservations = await db.reservation.findMany({
    where: {
      tenant_id: tenantId,
      ...(status ? { status } : {}),
      ...(property_id ? { property_id } : {}),
    },
    include: { property: { select: { id: true, name: true, city: true } } },
    orderBy: { check_in: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const data = await req.json();
  const nights = Math.round(
    (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / 86400000
  );

  const ref = "HP-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4).padStart(4, "0");

  const reservation = await db.reservation.create({
    data: {
      tenant_id: tenantId,
      property_id: data.property_id,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      guest_phone: data.guest_phone,
      guest_nationality: data.guest_nationality,
      check_in: data.check_in,
      check_out: data.check_out,
      nights,
      adults: data.adults ?? 1,
      children: data.children ?? 0,
      total_amount: data.total_amount ? parseFloat(data.total_amount) : undefined,
      cleaning_fee: data.cleaning_fee ? parseFloat(data.cleaning_fee) : undefined,
      net_revenue: data.net_revenue ? parseFloat(data.net_revenue) : undefined,
      source: data.source ?? "manual",
      status: data.status ?? "confirmed",
      notes_internal: data.notes_internal,
      reference: data.reference ?? ref,
    },
    include: { property: { select: { id: true, name: true } } },
  });

  // Mettre à jour le compteur de nuitées conformité
  await db.complianceRecord.updateMany({
    where: { property_id: data.property_id },
    data: { nuitees_year: { increment: nights } },
  }).catch(() => null);

  return NextResponse.json(reservation, { status: 201 });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/auth-server";
import { requireAuth, parseBody } from "@/lib/api-guard";
import { z } from "zod";

const ReservationSchema = z.object({
  property_id: z.string().min(1),
  guest_name: z.string().min(1).max(200),
  guest_email: z.string().email().optional(),
  guest_phone: z.string().max(50).optional(),
  guest_nationality: z.string().max(10).optional(),
  check_in: z.string().min(1),
  check_out: z.string().min(1),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  total_amount: z.number().positive().optional(),
  cleaning_fee: z.number().min(0).optional(),
  net_revenue: z.number().min(0).optional(),
  source: z.string().default("manual"),
  status: z.string().default("confirmed"),
  notes_internal: z.string().max(2000).optional(),
  reference: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
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

  // Normalize for UI compatibility
  const normalized = reservations.map((r) => ({
    ...r,
    // UI aliases
    reservation_code: r.reference,
    total_price: r.total_amount,
    guests: (r.adults ?? 1) + (r.children ?? 0),
    property_name: r.property?.name ?? "",
    property_city: r.property?.city ?? "",
    property: undefined, // flatten
  }));

  return NextResponse.json(normalized);
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
  const tenantId = getTenantId(req, auth);

  const body = await parseBody(req, ReservationSchema);
  if (body instanceof NextResponse) return body;

  const nights = Math.round(
    (new Date(body.check_out).getTime() - new Date(body.check_in).getTime()) / 86400000
  );

  const ref = "HP-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4).padStart(4, "0");

  const reservation = await db.reservation.create({
    data: {
      tenant_id: tenantId,
      property_id: body.property_id,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      guest_phone: body.guest_phone,
      guest_nationality: body.guest_nationality,
      check_in: body.check_in,
      check_out: body.check_out,
      nights,
      adults: body.adults,
      children: body.children,
      total_amount: body.total_amount,
      cleaning_fee: body.cleaning_fee,
      net_revenue: body.net_revenue,
      source: body.source,
      status: body.status,
      notes_internal: body.notes_internal,
      reference: body.reference ?? ref,
    },
    include: { property: { select: { id: true, name: true } } },
  });

  // Mettre à jour le compteur de nuitées conformité
  await db.complianceRecord.updateMany({
    where: { property_id: body.property_id },
    data: { nuitees_year: { increment: nights } },
  }).catch(() => null);

  return NextResponse.json(reservation, { status: 201 });
}

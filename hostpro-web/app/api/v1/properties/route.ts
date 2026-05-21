export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/auth-server";
import { requireAuth, parseBody } from "@/lib/api-guard";
import { z } from "zod";

const PropertySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  property_type: z.string().default("apartment"),
  status: z.string().default("active"),
  address: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().default("FR"),
  max_guests: z.number().int().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  surface_m2: z.number().positive().optional(),
  base_price_night: z.number().positive().optional(),
  cleaning_fee: z.number().min(0).default(0),
  security_deposit: z.number().min(0).default(0),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  const properties = await db.property.findMany({
    where: { tenant_id: tenantId, ...(status ? { status } : {}) },
    include: { photos: { where: { is_cover: true }, take: 1 }, compliance: true },
    orderBy: { created_at: "desc" },
  });

  // Normalize for UI compatibility
  const normalized = properties.map((p) => ({
    ...p,
    // UI aliases
    type: p.property_type,
    base_price: p.base_price_night,
    amenities: (() => { try { return JSON.parse(p.amenities as string); } catch { return []; } })(),
    // Computed fields — no real-time calculation here for list view perf
    monthly_revenue: null,
    occupancy_rate: null,
    nights_booked: null,
    platforms: [],
  }));

  return NextResponse.json(normalized);
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
  const tenantId = getTenantId(req, auth);

  const body = await parseBody(req, PropertySchema);
  if (body instanceof NextResponse) return body;

  const property = await db.property.create({
    data: {
      tenant_id: tenantId,
      name: body.name,
      description: body.description,
      property_type: body.property_type,
      status: body.status,
      address: body.address,
      city: body.city,
      postal_code: body.postal_code,
      country: body.country,
      max_guests: body.max_guests,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      surface_m2: body.surface_m2,
      base_price_night: body.base_price_night,
      cleaning_fee: body.cleaning_fee,
      check_in_time: body.check_in_time ?? "16:00",
      check_out_time: body.check_out_time ?? "11:00",
      amenities: JSON.stringify(body.amenities ?? []),
    },
  });

  // Créer le dossier conformité automatiquement
  await db.complianceRecord.create({ data: { property_id: property.id } }).catch(() => null);

  return NextResponse.json(property, { status: 201 });
}

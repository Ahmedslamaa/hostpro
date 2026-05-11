import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  const properties = await db.property.findMany({
    where: { tenant_id: tenantId, ...(status ? { status } : {}) },
    include: { photos: { where: { is_cover: true }, take: 1 }, compliance: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const data = await req.json();
  const property = await db.property.create({
    data: {
      tenant_id: tenantId,
      name: data.name,
      description: data.description,
      property_type: data.property_type ?? "apartment",
      status: data.status ?? "active",
      address: data.address,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country ?? "FR",
      max_guests: data.max_guests ? parseInt(data.max_guests) : undefined,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
      surface_m2: data.surface_m2 ? parseFloat(data.surface_m2) : undefined,
      base_price_night: data.base_price_night ? parseFloat(data.base_price_night) : undefined,
      cleaning_fee: data.cleaning_fee ? parseFloat(data.cleaning_fee) : 0,
      check_in_time: data.check_in_time ?? "16:00",
      check_out_time: data.check_out_time ?? "11:00",
      amenities: JSON.stringify(data.amenities ?? []),
    },
  });

  // Créer le dossier conformité automatiquement
  await db.complianceRecord.create({ data: { property_id: property.id } }).catch(() => null);

  return NextResponse.json(property, { status: 201 });
}

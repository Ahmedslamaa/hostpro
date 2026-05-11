import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

async function guard(req: NextRequest, id: string) {
  const auth = getAuthFromRequest(req);
  if (!auth) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  const tenantId = getTenantId(req, auth);
  const property = await db.property.findFirst({ where: { id, tenant_id: tenantId } });
  if (!property) return { error: NextResponse.json({ error: "Propriété introuvable" }, { status: 404 }) };
  return { auth, tenantId, property };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guard(req, params.id);
  if ("error" in g) return g.error;

  const property = await db.property.findUnique({
    where: { id: params.id },
    include: {
      photos: { orderBy: { position: "asc" } },
      compliance: true,
      ical_feeds: true,
      reservations: { orderBy: { check_in: "desc" }, take: 10 },
      tasks: { where: { status: { not: "done" } }, take: 10 },
    },
  });
  return NextResponse.json(property);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guard(req, params.id);
  if ("error" in g) return g.error;

  const data = await req.json();
  const property = await db.property.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      property_type: data.property_type,
      status: data.status,
      address: data.address,
      city: data.city,
      postal_code: data.postal_code,
      max_guests: data.max_guests !== undefined ? parseInt(data.max_guests) : undefined,
      bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms) : undefined,
      bathrooms: data.bathrooms !== undefined ? parseInt(data.bathrooms) : undefined,
      base_price_night: data.base_price_night !== undefined ? parseFloat(data.base_price_night) : undefined,
      cleaning_fee: data.cleaning_fee !== undefined ? parseFloat(data.cleaning_fee) : undefined,
      check_in_time: data.check_in_time,
      check_out_time: data.check_out_time,
      amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
    },
  });
  return NextResponse.json(property);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guard(req, params.id);
  if ("error" in g) return g.error;

  await db.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

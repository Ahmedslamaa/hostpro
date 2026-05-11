import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const res = await db.reservation.findUnique({
    where: { id: params.id },
    include: { property: true },
  });
  return res ? NextResponse.json(res) : NextResponse.json({ error: "Introuvable" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const data = await req.json();
  const reservation = await db.reservation.update({
    where: { id: params.id },
    data: {
      status: data.status,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      total_amount: data.total_amount ? parseFloat(data.total_amount) : undefined,
      notes_internal: data.notes_internal,
    },
  });
  return NextResponse.json(reservation);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await db.reservation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

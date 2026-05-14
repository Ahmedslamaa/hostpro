export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { role } = await req.json();
  const member = await db.userTenant.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await db.userTenant.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

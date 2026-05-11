import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, email: true, full_name: true, avatar_url: true, created_at: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const tenant = await db.tenant.findUnique({ where: { id: auth.tenant_id } });

  return NextResponse.json({ ...user, tenant_id: auth.tenant_id, role: auth.role, plan: tenant?.plan ?? "starter" });
}

export async function PATCH(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { full_name, avatar_url } = await req.json();
  const user = await db.user.update({
    where: { id: auth.sub },
    data: { full_name: full_name ?? undefined, avatar_url: avatar_url ?? undefined },
    select: { id: true, email: true, full_name: true, avatar_url: true },
  });
  return NextResponse.json(user);
}

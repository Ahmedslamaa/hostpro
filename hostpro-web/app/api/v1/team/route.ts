import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId, hashPassword } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const members = await db.userTenant.findMany({
    where: { tenant_id: tenantId },
    include: { user: { select: { id: true, email: true, full_name: true, avatar_url: true, last_login_at: true } } },
    orderBy: { joined_at: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      email: m.user.email,
      full_name: m.user.full_name,
      avatar_url: m.user.avatar_url,
      role: m.role,
      is_active: m.is_active,
      joined_at: m.joined_at,
      last_login_at: m.user.last_login_at,
    }))
  );
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const tenantId = getTenantId(req, auth);

  const { email, role, full_name } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  // Trouver ou créer l'utilisateur
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    const tempPassword = Math.random().toString(36).slice(2, 12);
    user = await db.user.create({
      data: { email, password_hash: await hashPassword(tempPassword), full_name: full_name ?? null },
    });
  }

  const existing = await db.userTenant.findUnique({ where: { user_id_tenant_id: { user_id: user.id, tenant_id: tenantId } } });
  if (existing) return NextResponse.json({ error: "Cet utilisateur est déjà membre" }, { status: 409 });

  const member = await db.userTenant.create({
    data: { user_id: user.id, tenant_id: tenantId, role: role ?? "viewer", invited_by: auth.sub },
    include: { user: { select: { email: true, full_name: true } } },
  });

  return NextResponse.json(member, { status: 201 });
}

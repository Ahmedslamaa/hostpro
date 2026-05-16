import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createTokenPair } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, company_name, tenant_name } = await req.json();
    const tenantDisplayName = company_name ?? tenant_name;

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    // Créer le tenant + user en transaction
    const result = await db.$transaction(async (tx) => {
      const slug = (tenantDisplayName ?? email.split("@")[0])
        .toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 32) + "-" + Date.now().toString(36);

      const tenant = await tx.tenant.create({
        data: { name: tenantDisplayName ?? full_name ?? email, slug, plan: "starter" },
      });

      const user = await tx.user.create({
        data: {
          email,
          password_hash: await hashPassword(password),
          full_name: full_name ?? null,
          gdpr_consent_at: new Date(),
          gdpr_consent_ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
        },
      });

      await tx.userTenant.create({
        data: { user_id: user.id, tenant_id: tenant.id, role: "admin" },
      });

      return { user, tenant };
    });

    const { accessToken, refreshToken } = await createTokenPair(
      result.user.id,
      result.tenant.id,
      result.user.email,
      "admin",
      req
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/" };

    const response = NextResponse.json(
      { user: { id: result.user.id, email: result.user.email, full_name: result.user.full_name }, tenant_id: result.tenant.id, access_token: accessToken },
      { status: 201 }
    );
    response.cookies.set("access_token", accessToken, { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refresh_token", refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set("tenant_id", result.tenant.id, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

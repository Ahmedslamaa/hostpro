import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createTokenPair } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Compte verrouillé
    if (user?.locked_until && user.locked_until > new Date()) {
      return NextResponse.json({ error: "Compte temporairement verrouillé. Réessayez dans quelques minutes." }, { status: 423 });
    }

    const valid = user ? await verifyPassword(password, user.password_hash) : false;

    if (!user || !valid) {
      // Incrémenter les tentatives échouées
      if (user) {
        const attempts = user.failed_login_attempts + 1;
        await db.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: attempts,
            locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
          },
        });
      }
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // Réinitialiser les tentatives
    await db.user.update({
      where: { id: user.id },
      data: { failed_login_attempts: 0, locked_until: null, last_login_at: new Date() },
    });

    const userTenant = await db.userTenant.findFirst({ where: { user_id: user.id, is_active: true } });
    if (!userTenant) {
      return NextResponse.json({ error: "Aucun accès trouvé" }, { status: 403 });
    }

    const { accessToken, refreshToken } = await createTokenPair(
      user.id, userTenant.tenant_id, user.email, userTenant.role, req
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/" };

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, full_name: user.full_name },
      tenant_id: userTenant.tenant_id,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    response.cookies.set("access_token", accessToken, { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refresh_token", refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set("tenant_id", userTenant.tenant_id, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

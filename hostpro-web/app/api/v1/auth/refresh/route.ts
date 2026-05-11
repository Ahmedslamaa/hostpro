import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRefreshToken, signAccessToken, signRefreshToken, hashToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("refresh_token")?.value;
    const bodyToken = await req.json().then((b) => b?.refresh_token).catch(() => null);
    const token = cookieToken ?? bodyToken;

    if (!token) return NextResponse.json({ error: "Refresh token manquant" }, { status: 401 });

    const payload = verifyRefreshToken(token);
    const tokenHash = hashToken(token);

    const stored = await db.refreshToken.findUnique({ where: { token_hash: tokenHash } });
    if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
    }

    // Rotation — révoquer l'ancien, créer un nouveau
    await db.refreshToken.update({ where: { id: stored.id }, data: { revoked_at: new Date() } });

    const newRefresh = signRefreshToken({ sub: payload.sub, tenant_id: payload.tenant_id, email: payload.email, role: payload.role });
    const newAccess = signAccessToken({ sub: payload.sub, tenant_id: payload.tenant_id, email: payload.email, role: payload.role });

    await db.refreshToken.create({
      data: {
        user_id: payload.sub,
        token_hash: hashToken(newRefresh),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/" };

    const response = NextResponse.json({ access_token: newAccess });
    response.cookies.set("access_token", newAccess, { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refresh_token", newRefresh, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}

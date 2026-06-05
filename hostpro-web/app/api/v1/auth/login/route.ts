export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createTokenPair } from "@/lib/auth-server";
import { loginRateLimit } from "@/lib/ip-rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // ── 1. IP-based DB rate limit (persists across serverless invocations) ──────
  const rl = await loginRateLimit(ip);
  if (!rl.allowed) {
    await logSecurityEvent("login_locked", {
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { reason: "ip_rate_limit", retryAfter: rl.retryAfterSeconds },
    });
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      {
        status: 429,
        headers: {
          "Retry-After":          String(rl.retryAfterSeconds),
          "X-RateLimit-Limit":    "5",
          "X-RateLimit-Remaining":"0",
          "X-RateLimit-Reset":    String(Math.ceil(rl.resetAt.getTime() / 1000)),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const email    = typeof body?.email    === "string" ? body.email.toLowerCase().trim()   : null;
    const password = typeof body?.password === "string" ? body.password : null;

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // ── 2. Lookup user ────────────────────────────────────────────────────────
    const user = await db.user.findUnique({ where: { email } });

    // Account-level lockout check
    if (user?.locked_until && user.locked_until > new Date()) {
      await logSecurityEvent("login_locked", {
        userId: user.id,
        ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
        metadata: { reason: "account_locked", until: user.locked_until },
      });
      return NextResponse.json(
        { error: "Compte temporairement verrouillé. Réessayez dans quelques minutes." },
        { status: 423 }
      );
    }

    // ── 3. Verify credentials ─────────────────────────────────────────────────
    // Always run bcrypt to prevent timing oracle (compare against dummy hash if user not found)
    const DUMMY_HASH = "$2a$12$oEoHTBxFJWQthbPpJaTvxOXMFhHJqf0M8qkdJxKQ7VVXn9Dy2WGiC";
    const valid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !valid) {
      if (user) {
        const attempts = user.failed_login_attempts + 1;
        await db.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: attempts,
            locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
          },
        });
        await logSecurityEvent("login_failure", {
          userId: user.id,
          ip,
          userAgent: req.headers.get("user-agent") ?? undefined,
          metadata: { attempts },
        });
      }
      // Identical response for both "no user" and "wrong password" — prevents user enumeration
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Compte désactivé. Contactez le support." }, { status: 403 });
    }

    // ── 4. Reset failed attempts, update last login ───────────────────────────
    await db.user.update({
      where: { id: user.id },
      data: { failed_login_attempts: 0, locked_until: null, last_login_at: new Date() },
    });

    // ── 5. Resolve tenant ─────────────────────────────────────────────────────
    const userTenant = await db.userTenant.findFirst({
      where: { user_id: user.id, is_active: true },
    });
    if (!userTenant) {
      return NextResponse.json({ error: "Aucun accès trouvé" }, { status: 403 });
    }

    // ── 6. Create token pair ──────────────────────────────────────────────────
    const { accessToken, refreshToken } = await createTokenPair(
      user.id,
      userTenant.tenant_id,
      user.email,
      userTenant.role,
      req
    );

    await logSecurityEvent("login_success", {
      userId: user.id,
      tenantId: userTenant.tenant_id,
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // ── 7. Set httpOnly cookies ───────────────────────────────────────────────
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" };

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, full_name: user.full_name },
      tenant_id: userTenant.tenant_id,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    response.cookies.set("access_token",  accessToken,          { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refresh_token", refreshToken,         { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set("tenant_id",     userTenant.tenant_id, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;

  } catch (e) {
    // SECURITY: never expose stack traces in responses
    console.error("[login] unexpected error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

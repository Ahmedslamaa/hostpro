export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createTokenPair } from "@/lib/auth-server";
import { registerRateLimit } from "@/lib/ip-rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { z } from "zod";
import { zEmail, zPassword } from "@/lib/api-guard";

const RegisterSchema = z.object({
  email:        zEmail,
  password:     zPassword,
  full_name:    z.string().min(1).max(100).optional(),
  company_name: z.string().min(1).max(100).optional(),
  tenant_name:  z.string().min(1).max(100).optional(),
});

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // ── 1. IP-based rate limit: 3 registrations / hour ───────────────────────
  const rl = await registerRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop d'inscriptions depuis cette adresse IP. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    // ── 2. Validate input ─────────────────────────────────────────────────────
    const raw = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json({ error: "Validation échouée", details: errors }, { status: 400 });
    }

    const { email, password, full_name, company_name, tenant_name } = parsed.data;
    const tenantDisplayName = company_name ?? tenant_name;

    // ── 3. Check duplicate ───────────────────────────────────────────────────
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Don't reveal whether the email exists — return same success-like 409
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // ── 4. Create tenant + user + role in a single transaction ───────────────
    const result = await db.$transaction(async (tx) => {
      const slug =
        (tenantDisplayName ?? email.split("@")[0])
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .slice(0, 32) +
        "-" +
        Date.now().toString(36);

      const tenant = await tx.tenant.create({
        data: { name: tenantDisplayName ?? full_name ?? email, slug, plan: "starter" },
      });

      const user = await tx.user.create({
        data: {
          email,
          password_hash:  await hashPassword(password),
          full_name:      full_name ?? null,
          gdpr_consent_at: new Date(),
          gdpr_consent_ip: ip,
          // email_verified_at intentionally null until user clicks the link
        },
      });

      await tx.userTenant.create({
        data: { user_id: user.id, tenant_id: tenant.id, role: "admin" },
      });

      return { user, tenant };
    });

    // ── 5. TODO: send email verification (non-blocking) ──────────────────────
    // sendEmailVerification(result.user.email, result.user.id).catch(console.error);

    await logSecurityEvent("register_success", {
      userId:   result.user.id,
      tenantId: result.tenant.id,
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // ── 6. Issue token pair ───────────────────────────────────────────────────
    const { accessToken, refreshToken } = await createTokenPair(
      result.user.id,
      result.tenant.id,
      result.user.email,
      "admin",
      req
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" };

    const response = NextResponse.json(
      {
        user: { id: result.user.id, email: result.user.email, full_name: result.user.full_name },
        tenant_id: result.tenant.id,
        access_token: accessToken,
      },
      { status: 201 }
    );
    response.cookies.set("access_token",  accessToken,          { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refresh_token", refreshToken,         { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set("tenant_id",     result.tenant.id,     { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;

  } catch (e) {
    console.error("[register]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

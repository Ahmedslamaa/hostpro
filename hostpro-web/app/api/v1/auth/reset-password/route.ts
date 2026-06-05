export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, hashPassword } from "@/lib/auth-server";
import { resetRateLimit } from "@/lib/ip-rate-limit";
import { sendPasswordChangedEmail } from "@/lib/email";
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 12;

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Minimum ${MIN_PASSWORD_LENGTH} caractères`)
    .max(128, "Maximum 128 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[a-z]/, "Au moins une minuscule")
    .regex(/[0-9]/, "Au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
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

  // ── 1. Rate limit: 5 reset attempts / hour per IP ─────────────────────────
  const rl = await resetRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    // ── 2. Validate input ────────────────────────────────────────────────────
    const raw = await req.json().catch(() => null);
    const parsed = ResetSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json({ error: "Validation échouée", details: errors }, { status: 400 });
    }
    const { token, password } = parsed.data;

    // ── 3. Look up token ─────────────────────────────────────────────────────
    const tokenHash  = hashToken(token);
    const resetToken = await db.passwordResetToken.findUnique({ where: { token_hash: tokenHash } });

    // Constant-time response for invalid/used/expired tokens
    if (!resetToken || resetToken.used_at || resetToken.expires_at < new Date()) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(password);

    // ── 4. Atomic update: new password + invalidate token + revoke all sessions
    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: resetToken.user_id },
        data: {
          password_hash:        newHash,
          failed_login_attempts: 0,
          locked_until:         null,
        },
        select: { email: true },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      }),
      // Revoke ALL refresh tokens — forces re-login on all devices
      db.refreshToken.updateMany({
        where: { user_id: resetToken.user_id },
        data:  { revoked_at: new Date() },
      }),
    ]);

    // ── 5. Notify user by email (non-blocking) ───────────────────────────────
    sendPasswordChangedEmail(updatedUser.email).catch((err) =>
      console.error("[reset-password] email notification failed:", err)
    );

    // ── 6. Audit log ──────────────────────────────────────────────────────────
    await db.auditLog.create({
      data: {
        user_id:    resetToken.user_id,
        action:     "password_reset_completed",
        resource:   "user",
        resource_id: resetToken.user_id,
        ip_address: ip,
        user_agent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (e) {
    console.error("[reset-password]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

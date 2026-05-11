import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, hashPassword } from "@/lib/auth-server";

const MIN_PASSWORD_LENGTH = 8;

function isStrongPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
        },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (
      !resetToken ||
      resetToken.used_at ||
      resetToken.expires_at < new Date()
    ) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(password);

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.user_id },
        data: {
          password_hash: newHash,
          failed_login_attempts: 0,
          locked_until: null,
        },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      }),
      // Revoke all refresh tokens for security
      db.refreshToken.updateMany({
        where: { user_id: resetToken.user_id },
        data: { revoked_at: new Date() },
      }),
    ]);

    await db.auditLog.create({
      data: {
        user_id: resetToken.user_id,
        action: "password_reset_completed",
        resource: "user",
        resource_id: resetToken.user_id,
        ip_address:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
        user_agent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

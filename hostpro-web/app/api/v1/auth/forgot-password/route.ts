import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth-server";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Always return 200 to avoid email enumeration
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (user && user.is_active) {
      // Invalidate existing tokens for this user
      await db.passwordResetToken.updateMany({
        where: { user_id: user.id, used_at: null },
        data: { used_at: new Date() },
      });

      const rawToken = crypto.randomBytes(32).toString("hex");
      await db.passwordResetToken.create({
        data: {
          user_id: user.id,
          token_hash: hashToken(rawToken),
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min
          ip_address:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            undefined,
        },
      });

      await sendPasswordResetEmail(user.email, rawToken);

      await db.auditLog.create({
        data: {
          user_id: user.id,
          action: "password_reset_requested",
          resource: "user",
          resource_id: user.id,
          ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
          user_agent: req.headers.get("user-agent") ?? undefined,
        },
      });
    }

    // Always same response to prevent email enumeration
    return NextResponse.json({
      message: "Si ce compte existe, un email de réinitialisation a été envoyé.",
    });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

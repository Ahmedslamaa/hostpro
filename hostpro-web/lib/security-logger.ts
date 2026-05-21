/**
 * Logger de sécurité — enregistre les événements sensibles en DB
 */
import { db } from "./db";

type SecurityEvent =
  | "login_success" | "login_failure" | "login_locked"
  | "token_refresh" | "token_revoked"
  | "password_reset_requested" | "password_reset_success"
  | "register_success";

export async function logSecurityEvent(
  action: SecurityEvent,
  opts: {
    userId?: string;
    tenantId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        resource: "auth",
        user_id: opts.userId,
        tenant_id: opts.tenantId,
        ip_address: opts.ip,
        user_agent: opts.userAgent,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : undefined,
      },
    });
  } catch {
    // Ne jamais bloquer l'auth flow sur une erreur de log
  }
}

/**
 * DB-backed IP rate limiting
 * Works across serverless invocations — unlike in-memory Maps.
 * Uses upsert with atomic increment via PostgreSQL.
 */

import { db } from "./db";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

/**
 * Check and increment a rate-limit bucket.
 *
 * @param key      Bucket key, e.g. "auth:1.2.3.4"
 * @param limit    Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  try {
    // Atomic upsert: create or reset expired window, then increment
    const result = await db.$transaction(async (tx) => {
      // Delete expired entries for this key
      await (tx as any).ipRateLimit.deleteMany({
        where: { key, window_end: { lt: now } },
      });

      // Upsert — create with count=1 or increment existing
      const record = await (tx as any).ipRateLimit.upsert({
        where: { key },
        create: { key, count: 1, window_end: windowEnd },
        update: { count: { increment: 1 }, updated_at: now },
      });

      return record;
    });

    const allowed = result.count <= limit;
    const remaining = Math.max(0, limit - result.count);
    const resetAt = result.window_end;
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

    return { allowed, remaining, resetAt, retryAfterSeconds };
  } catch (err) {
    // On DB error, fail open (allow request) but log
    console.error("[rate-limit] DB error — failing open:", err);
    return { allowed: true, remaining: limit, resetAt: windowEnd, retryAfterSeconds: 0 };
  }
}

/**
 * Cleanup expired rate limit entries (run occasionally).
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  try {
    await (db as any).ipRateLimit.deleteMany({
      where: { window_end: { lt: new Date() } },
    });
  } catch {
    // Non-critical
  }
}

// ── Preset limiters ───────────────────────────────────────────────────────────

/** Login: 5 attempts / 15 min per IP */
export const loginRateLimit = (ip: string) =>
  checkRateLimit(`auth:login:${ip}`, 5, 15 * 60_000);

/** Register: 3 accounts / hour per IP */
export const registerRateLimit = (ip: string) =>
  checkRateLimit(`auth:register:${ip}`, 3, 60 * 60_000);

/** Password reset: 5 requests / hour per IP */
export const resetRateLimit = (ip: string) =>
  checkRateLimit(`auth:reset:${ip}`, 5, 60 * 60_000);

/** General API: 120 req / min per IP (serverless-safe supplement) */
export const apiRateLimit = (ip: string) =>
  checkRateLimit(`api:${ip}`, 120, 60_000);

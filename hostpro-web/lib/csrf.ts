/**
 * CSRF Protection — Double-Submit Cookie Pattern
 *
 * How it works:
 *  1. On first page load the server sets a `csrf_token` cookie (not httpOnly).
 *  2. Client-side JS reads it and adds it as `X-CSRF-Token` header on every mutating request.
 *  3. Server compares cookie value vs header value — if they match, the request is legit.
 *     (Cross-site requests can't read cookies from another origin, so they can't set the header.)
 *
 * This is safe for SPA / Next.js because:
 *  - The cookie is readable by JS (intentionally not httpOnly).
 *  - Attacker on another origin cannot read the cookie value → cannot forge the header.
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_BYTES = 32;

// Paths that DON'T require CSRF (public endpoints, webhooks, GET/HEAD)
const CSRF_EXEMPT_PATHS = [
  "/api/v1/auth/login",        // Login itself sets the token after auth
  "/api/v1/auth/register",     // Same
  "/api/v1/auth/refresh",      // Token-based, not session
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/webhooks/stripe",      // Stripe signs its own webhooks
  "/api/health",
];

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Generate a cryptographically random CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validate CSRF token on a mutating request.
 * Returns true if valid, false if missing/mismatch.
 */
export function validateCsrf(req: NextRequest): boolean {
  const method   = req.method.toUpperCase();
  const path     = req.nextUrl.pathname;

  if (SAFE_METHODS.has(method)) return true;
  if (CSRF_EXEMPT_PATHS.some((p) => path.startsWith(p))) return true;

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  return safeEqual(cookieToken, headerToken);
}

/**
 * Set CSRF cookie on a response (called when the cookie is missing or on login).
 */
export function setCsrfCookie(response: NextResponse, isProd: boolean): string {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,   // Intentional: JS must be able to read it
    secure:   isProd,
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 24, // 24 hours
  });
  return token;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateCsrf, setCsrfCookie } from "@/lib/csrf";

// ── Public paths — no auth required ──────────────────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/demo",
  "/privacy",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/demo",
  "/api/health",
  "/api/webhooks/stripe",
  "/sw.js",
];

// ── Auth-sensitive paths (for scanner-block only — actual RL done in DB) ─────
const AUTH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];

// ── Lightweight in-memory rate limit (first-line, per serverless isolate) ────
// NOTE: True persistent rate limiting happens in DB (lib/ip-rate-limit.ts).
// This acts as a fast early-exit guard within a single isolate's lifetime.
const authMap = new Map<string, { count: number; reset: number }>();

function memRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = authMap.get(key);
  if (!entry || now > entry.reset) {
    authMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Cleanup stale entries every 5 min
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  authMap.forEach((val, key) => { if (now > val.reset) authMap.delete(key); });
}

// ── Known scanner / fuzzer user-agents ───────────────────────────────────────
const BLOCKED_UA = /sqlmap|nikto|nessus|masscan|ZmEu|dirbuster|acunetix|nuclei|wfuzz|burpsuite|havij|w3af|commix/i;

// ── Security headers (applied to ALL responses) ───────────────────────────────
const isProd = process.env.NODE_ENV === "production";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options":               "DENY",
  "X-Content-Type-Options":        "nosniff",
  "Referrer-Policy":               "strict-origin-when-cross-origin",
  "Permissions-Policy":            "camera=(), microphone=(), geolocation=(self), payment=()",
  "Cross-Origin-Opener-Policy":    "same-origin",
  "Cross-Origin-Resource-Policy":  "same-origin",
  "X-Request-ID":                  "", // placeholder — set dynamically below
};

if (isProd) {
  SECURITY_HEADERS["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  SECURITY_HEADERS["Cross-Origin-Embedder-Policy"] = "require-corp";
}

// ── Main middleware ───────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  maybeCleanup();

  // ── 1. Path traversal / null-byte attacks ────────────────────────────────
  if (
    pathname.includes("..") ||
    pathname.includes("%2e%2e") ||
    pathname.includes("%2F%2F") ||
    pathname.includes("%00") ||
    pathname.includes("\x00")
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 2. Block scanner user-agents ─────────────────────────────────────────
  const ua = request.headers.get("user-agent") ?? "";
  if (BLOCKED_UA.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 3. IP extraction ──────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // ── 4. In-memory gate for auth paths (per-isolate first line) ────────────
  if (AUTH_PATHS.some((p) => pathname === p)) {
    if (!memRateLimit(ip, 20, 5 * 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After":  "300",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // ── 5. CSRF validation for mutating API requests ─────────────────────────
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks/")) {
    if (!validateCsrf(request)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid or missing CSRF token" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── 6. Static / Next.js internals — allow without auth ───────────────────
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/apple-splash") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    pathname === "/browserconfig.xml" ||
    pathname === "/og-image.png"
  ) {
    return applySecurityHeaders(NextResponse.next(), ip);
  }

  // ── 7. Public paths ───────────────────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
  );
  if (isPublic) {
    const res = applySecurityHeaders(NextResponse.next(), ip);
    // Ensure CSRF cookie exists on page loads
    if (!pathname.startsWith("/api/") && !request.cookies.get("csrf_token")) {
      setCsrfCookie(res, isProd);
    }
    return res;
  }

  // ── 8. Auth check ─────────────────────────────────────────────────────────
  const cookieToken = request.cookies.get("access_token")?.value;

  if (pathname.startsWith("/api/")) {
    if (!cookieToken) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Bearer present — let the route handler validate it
      return applySecurityHeaders(NextResponse.next(), ip);
    }

    // Forward cookie token as x-auth-token so route handlers can pick it up
    const headers = new Headers(request.headers);
    headers.set("x-auth-token", cookieToken);
    const res = NextResponse.next({ request: { headers } });
    return applySecurityHeaders(res, ip);
  }

  // ── 9. Page protection ────────────────────────────────────────────────────
  if (!cookieToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const res = applySecurityHeaders(NextResponse.next(), ip);
  // Ensure CSRF cookie exists on authenticated page loads
  if (!request.cookies.get("csrf_token")) {
    setCsrfCookie(res, isProd);
  }
  return res;
}

// ── Helper — inject security headers + request ID ────────────────────────────
function applySecurityHeaders(response: NextResponse, _ip: string): NextResponse {
  const reqId = crypto.randomUUID();
  response.headers.set("X-Request-ID", reqId);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (key !== "X-Request-ID" && value) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};

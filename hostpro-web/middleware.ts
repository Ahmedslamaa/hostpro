import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Routes publiques (sans auth) ─────────────────────────────────────────────
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

// ── Rate limit buckets ────────────────────────────────────────────────────────
// Two tiers: strict for auth endpoints, standard for the rest
const standardMap = new Map<string, { count: number; reset: number }>();
const authMap = new Map<string, { count: number; reset: number }>();

function rateLimit(
  map: Map<string, { count: number; reset: number }>,
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.reset) {
    const reset = now + windowMs;
    map.set(key, { count: 1, reset });
    return { allowed: true, remaining: limit - 1, resetAt: reset };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.reset };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.reset };
}

// Cleanup stale entries every 5 min
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  [standardMap, authMap].forEach((map) => {
    map.forEach((val, key) => {
      if (now > val.reset) map.delete(key);
    });
  });
}

// ── Blocked user-agents (scanners / fuzzers) ──────────────────────────────────
const BLOCKED_UA = /sqlmap|nikto|nessus|masscan|ZmEu|dirbuster|acunetix|nuclei|wfuzz|burpsuite/i;

// ── Auth-sensitive paths (strict rate limit) ──────────────────────────────────
const AUTH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  cleanup();

  // ── 1. Block path traversal attempts ────────────────────────────────────────
  if (pathname.includes("..") || pathname.includes("%2e%2e") || pathname.includes("%00")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 2. Block scanner user-agents ────────────────────────────────────────────
  const ua = request.headers.get("user-agent") ?? "";
  if (BLOCKED_UA.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 3. Extract IP (supports proxies / Azure Load Balancer) ───────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // ── 4. Strict rate limiting for auth endpoints (10 req / 5 min per IP) ───────
  if (AUTH_PATHS.some((p) => pathname === p)) {
    const { allowed, remaining, resetAt } = rateLimit(authMap, ip, 10, 5 * 60_000);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }
    // Still add headers so client knows the limit
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "10");
    response.headers.set("X-RateLimit-Remaining", String(remaining));
  }

  // ── 5. Standard rate limiting for all API routes (120 req / min per IP) ──────
  if (pathname.startsWith("/api/")) {
    const { allowed, remaining, resetAt } = rateLimit(standardMap, ip, 120, 60_000);
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "120",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      });
    }
    void remaining;
  }

  // ── 6. Public paths — pass through ──────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
  );
  if (isPublic) {
    const response = NextResponse.next();
    response.headers.set("X-Request-ID", crypto.randomUUID());
    return response;
  }

  // ── 7. Static / Next.js internals — always allow ─────────────────────────────
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // ── 8. Auth check via httpOnly cookie ────────────────────────────────────────
  const cookieToken = request.cookies.get("access_token")?.value;

  if (pathname.startsWith("/api/")) {
    if (!cookieToken) {
      // Allow Bearer token — API routes verify themselves
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Forward cookie token as header so API routes can pick it up
    if (cookieToken) {
      const headers = new Headers(request.headers);
      headers.set("x-auth-token", cookieToken);
      const response = NextResponse.next({ request: { headers } });
      response.headers.set("X-Request-ID", crypto.randomUUID());
      return response;
    }
  }

  // ── 9. Page protection — redirect to login if no cookie ──────────────────────
  if (!cookieToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-ID", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|uploads/).*)",
  ],
};

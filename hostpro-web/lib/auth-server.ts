import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "./db";

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";

export interface JwtPayload {
  sub: string;       // user_id
  tenant_id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ── Password ────────────────────────────────────────────────────────────────
export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ── Tokens ───────────────────────────────────────────────────────────────────
export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ── Request auth ─────────────────────────────────────────────────────────────
export function getAuthFromRequest(req: NextRequest): JwtPayload | null {
  try {
    // 1. Cookie httpOnly (SSR)
    const cookieToken = req.cookies.get("access_token")?.value;
    if (cookieToken) return verifyAccessToken(cookieToken);

    // 2. x-auth-token injecté par le middleware
    const headerToken = req.headers.get("x-auth-token");
    if (headerToken) return verifyAccessToken(headerToken);

    // 3. Bearer Authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return verifyAccessToken(authHeader.slice(7));
    }

    return null;
  } catch {
    return null;
  }
}

// ── Tenant guard ─────────────────────────────────────────────────────────────
export function getTenantId(req: NextRequest, auth: JwtPayload): string {
  return req.headers.get("x-tenant-id") ?? auth.tenant_id;
}

// ── Create token pair + store refresh ────────────────────────────────────────
export async function createTokenPair(
  userId: string,
  tenantId: string,
  email: string,
  role: string,
  req: NextRequest
) {
  const payload = { sub: userId, tenant_id: tenantId, email, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Stocker le hash du refresh token en DB
  await db.refreshToken.create({
    data: {
      user_id: userId,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined,
      user_agent: req.headers.get("user-agent") ?? undefined,
    },
  });

  return { accessToken, refreshToken };
}

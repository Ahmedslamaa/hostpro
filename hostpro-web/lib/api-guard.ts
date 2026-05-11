import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, JwtPayload } from "./auth-server";
import { db } from "./db";
import { z, ZodSchema } from "zod";

export type Role = "admin" | "manager" | "viewer";
const ROLE_RANK: Record<Role, number> = { admin: 3, manager: 2, viewer: 1 };

export interface GuardContext {
  auth: JwtPayload;
  tenantId: string;
  requestId: string;
}

interface GuardOptions {
  /** Minimum role required. Default: "viewer" */
  minRole?: Role;
  /** If true, checks that the tenant is active in DB (costs one query). Default: false */
  checkTenant?: boolean;
}

/**
 * Centralised auth + tenant guard for API route handlers.
 *
 * Usage:
 *   const guard = await requireAuth(req, { minRole: "admin" });
 *   if (guard instanceof NextResponse) return guard;
 *   const { auth, tenantId } = guard;
 */
export async function requireAuth(
  req: NextRequest,
  opts: GuardOptions = {}
): Promise<GuardContext | NextResponse> {
  const { minRole = "viewer", checkTenant = false } = opts;

  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check
  const userRank = ROLE_RANK[auth.role as Role] ?? 0;
  const required = ROLE_RANK[minRole];
  if (userRank < required) {
    return NextResponse.json({ error: "Forbidden — insufficient role" }, { status: 403 });
  }

  const tenantId = req.headers.get("x-tenant-id") ?? auth.tenant_id;

  // Optional tenant activity check
  if (checkTenant) {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { is_active: true },
    });
    if (!tenant?.is_active) {
      return NextResponse.json({ error: "Tenant inactif ou introuvable" }, { status: 403 });
    }
  }

  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  return { auth, tenantId, requestId };
}

/**
 * Validates request body against a Zod schema.
 * Returns parsed data or a 400 NextResponse.
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const raw = await req.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json({ error: "Validation échouée", details: errors }, { status: 400 });
    }
    return result.data;
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 });
  }
}

/** Shorthand: parse + guard in one shot. */
export async function guardAndParse<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  opts: GuardOptions = {}
): Promise<{ ctx: GuardContext; body: T } | NextResponse> {
  const guard = await requireAuth(req, opts);
  if (guard instanceof NextResponse) return guard;

  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;

  return { ctx: guard, body };
}

// ── Common Zod helpers ───────────────────────────────────────────────────────

export const zEmail = z.string().email("Email invalide").toLowerCase().trim();
export const zPassword = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

export const zCuid = z.string().cuid("ID invalide");
export const zPositiveInt = z.number().int().positive();
export const zNonEmptyString = z.string().min(1, "Ne peut pas être vide").max(500);

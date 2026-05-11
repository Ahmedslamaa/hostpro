import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, hashToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  const cookieRefresh = req.cookies.get("refresh_token")?.value;

  if (cookieRefresh) {
    await db.refreshToken.updateMany({
      where: { token_hash: hashToken(cookieRefresh) },
      data: { revoked_at: new Date() },
    }).catch(() => null);
  }

  if (auth?.sub) {
    await db.auditLog.create({
      data: { user_id: auth.sub, tenant_id: auth.tenant_id, action: "logout", resource: "session" },
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("tenant_id", "", { maxAge: 0, path: "/" });
  return response;
}

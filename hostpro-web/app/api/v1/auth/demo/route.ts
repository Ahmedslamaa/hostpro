import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Demo mode non disponible en production" }, { status: 403 });
  }

  const demoPayload = {
    sub: "demo-user",
    tenant_id: "demo-tenant",
    email: "demo@hostpro.fr",
    role: "admin",
  };

  const accessToken  = signAccessToken(demoPayload);
  const refreshToken = signRefreshToken(demoPayload);

  const cookieOpts = { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/" };
  const dashboardUrl = new URL("/dashboard", request.url);

  const response = NextResponse.redirect(dashboardUrl);
  response.cookies.set("access_token",  accessToken,  { ...cookieOpts, maxAge: 60 * 15 });
  response.cookies.set("refresh_token", refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
  response.cookies.set("tenant_id",     "demo-tenant",{ ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });

  return response;
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // En production, afficher les credentials démo (pas de bypass auth)
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("demo", "true");
  return NextResponse.redirect(loginUrl);
}

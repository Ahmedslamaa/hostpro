import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/auth/demo?plan=starter|pro|enterprise
 * Redirige vers la page de login avec le plan démo pré-sélectionné.
 */
export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan") ?? "";
  const validPlans = ["starter", "pro", "enterprise"];

  const loginUrl = new URL("/login", request.url);

  if (validPlans.includes(plan)) {
    loginUrl.searchParams.set("plan", plan);
  } else {
    // Fallback : ouvre le sélecteur de plan sans pré-sélection
    loginUrl.searchParams.set("demo", "true");
  }

  return NextResponse.redirect(loginUrl);
}

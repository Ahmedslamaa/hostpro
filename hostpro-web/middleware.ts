import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Toujours autoriser les chemins publics
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"));
  if (isPublic) return NextResponse.next();

  // Vérifier le token dans les cookies (pour SSR) ou laisser le layout gérer (client)
  const token = request.cookies.get("access_token")?.value;

  // Si pas de token cookie, on laisse passer — le layout côté client redirige
  // C'est volontaire : tokens stockés en localStorage (client-only)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|_next).*)"],
};

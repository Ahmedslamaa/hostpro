import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Health check pour Azure App Service.
 * La vérification DB est désactivée tant que Prisma n'est pas installé.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    server: "ok",
  };

  // Vérification DB uniquement si Prisma est disponible en production
  // Pour l'activer : npm install @prisma/client && npx prisma generate
  if (process.env.DATABASE_URL && process.env.PRISMA_ENABLED === "true") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      await (prisma as any).$queryRawUnsafe("SELECT 1");
      await (prisma as any).$disconnect();
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
      version: process.env.npm_package_version ?? "0.0.0",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest, getTenantId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const property_id = searchParams.get("property_id");

  const tasks = await db.task.findMany({
    where: {
      tenant_id: tenantId,
      ...(status ? { status } : {}),
      ...(property_id ? { property_id } : {}),
    },
    include: { property: { select: { id: true, name: true } } },
    orderBy: [{ status: "asc" }, { due_date: "asc" }, { created_at: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const tenantId = getTenantId(req, auth);

  const data = await req.json();
  const task = await db.task.create({
    data: {
      tenant_id: tenantId,
      property_id: data.property_id ?? null,
      title: data.title,
      description: data.description,
      type: data.type ?? "cleaning",
      status: data.status ?? "pending",
      priority: data.priority ?? "normal",
      due_date: data.due_date ?? null,
      assigned_to: data.assigned_to ?? null,
      notes: data.notes ?? null,
    },
    include: { property: { select: { id: true, name: true } } },
  });

  return NextResponse.json(task, { status: 201 });
}

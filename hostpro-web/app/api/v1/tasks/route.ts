export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/auth-server";
import { requireAuth, parseBody } from "@/lib/api-guard";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  task_type: z.string().default("cleaning"),
  priority: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
  property_id: z.string().optional(),
  due_date: z.string().optional(),
  description: z.string().max(2000).optional(),
  assigned_to: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
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
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;
  const { auth } = guard;
  const tenantId = getTenantId(req, auth);

  const body = await parseBody(req, TaskSchema);
  if (body instanceof NextResponse) return body;

  const task = await db.task.create({
    data: {
      tenant_id: tenantId,
      property_id: body.property_id ?? null,
      title: body.title,
      description: body.description,
      type: body.task_type,
      status: body.status ?? "pending",
      priority: body.priority,
      due_date: body.due_date ?? null,
      assigned_to: body.assigned_to ?? null,
      notes: body.notes ?? null,
    },
    include: { property: { select: { id: true, name: true } } },
  });

  return NextResponse.json(task, { status: 201 });
}

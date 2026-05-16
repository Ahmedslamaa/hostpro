export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const data = await req.json();
  const task = await db.task.update({
    where: { id: params.id },
    data: {
      title: data.title,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
      assigned_to: data.assigned_to,
      notes: data.notes,
      completed_at: data.status === "done" ? new Date() : undefined,
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await db.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const messages = await db.message.findMany({
    where: { thread_id: params.id },
    orderBy: { created_at: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { content, sender } = await req.json();
  const message = await db.message.create({
    data: { thread_id: params.id, content, sender: sender ?? "host" },
  });

  await db.messageThread.update({
    where: { id: params.id },
    data: { last_message: content, last_message_at: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}

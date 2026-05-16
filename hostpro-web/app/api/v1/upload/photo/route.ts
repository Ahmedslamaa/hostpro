import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const property_id = formData.get("property_id") as string;

    if (!file || !property_id) {
      return NextResponse.json({ error: "Fichier et property_id requis" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (JPEG, PNG, WebP uniquement)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
    }

    // Sauvegarder sur disque (en prod  Azure Blob Storage)
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${property_id}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/photos/${filename}`;

    // Compter les photos existantes pour déterminer si c'est la couverture
    const existingCount = await db.propertyPhoto.count({ where: { property_id } });
    const isCover = existingCount === 0;

    const photo = await db.propertyPhoto.create({
      data: { property_id, url, filename, position: existingCount, is_cover: isCover },
    });

    if (isCover) {
      await db.property.update({ where: { id: property_id }, data: { cover_photo_url: url } });
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (e: any) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}

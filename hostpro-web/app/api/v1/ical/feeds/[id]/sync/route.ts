export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-server";
import ical from "node-ical";

interface CalEvent {
  type: string;
  dtstart?: Date | string | { val: string };
  dtend?: Date | string | { val: string };
  uid?: string;
  summary?: string;
}

function toDate(val: Date | string | { val: string } | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") return new Date(val);
  if ("val" in val) return new Date(val.val);
  return null;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const feed = await db.icalFeed.findUnique({
    where: { id: params.id },
    include: { property: { select: { tenant_id: true, name: true } } },
  });

  if (!feed) return NextResponse.json({ error: "Feed introuvable" }, { status: 404 });
  if (feed.property.tenant_id !== auth.tenant_id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const response = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const icsText = await response.text();
    const events = ical.parseICS(icsText);

    let imported = 0;
    let skipped = 0;

    for (const raw of Object.values(events)) {
      if (!raw) continue;
      const event = raw as unknown as CalEvent;
      if (event.type !== "VEVENT") continue;

      const start = toDate(event.dtstart);
      const end = toDate(event.dtend);
      if (!start || !end) continue;

      const checkIn = start.toISOString().slice(0, 10);
      const checkOut = end.toISOString().slice(0, 10);
      const nights = Math.round((end.getTime() - start.getTime()) / 86400000);

      if (nights <= 0) continue;

      const externalId = event.uid ?? `${feed.id}-${checkIn}`;
      const guestName = event.summary ?? `Réservation ${feed.platform}`;

      const existing = await db.reservation.findFirst({
        where: { property_id: feed.property_id, external_id: externalId },
      });

      if (existing) { skipped++; continue; }

      await db.reservation.create({
        data: {
          tenant_id: feed.property.tenant_id,
          property_id: feed.property_id,
          guest_name: guestName.replace(/BLOCKED|Airbnb|Booking/gi, "Réservation externe"),
          check_in: checkIn,
          check_out: checkOut,
          nights,
          source: feed.platform,
          status: "confirmed",
          external_id: externalId,
          reference: `EXT-${externalId.slice(0, 8).toUpperCase()}`,
        },
      });
      imported++;
    }

    await db.icalFeed.update({
      where: { id: feed.id },
      data: { last_sync: new Date() },
    });

    return NextResponse.json({ success: true, imported, skipped, total: imported + skipped });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Erreur de synchronisation : ${msg}` }, { status: 500 });
  }
}

"""
Service de synchronisation iCal — HOSTPRO
Importe les réservations depuis Airbnb, Booking.com, Abritel et tout flux iCal standard.
Tourne en background toutes les 15 minutes.
"""
import asyncio
import logging
import uuid as uuid_lib
from datetime import datetime, timezone, date
from typing import Optional

import httpx
from icalendar import Calendar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.calendar import CalendarEvent, IcalFeed
from app.models.reservation import Reservation, Guest

logger = logging.getLogger("ical_sync")

# ── Helpers ────────────────────────────────────────────────────

def _to_date(val) -> Optional[date]:
    """Convertit dtstart/dtend (date ou datetime) en date."""
    if val is None:
        return None
    if hasattr(val, "date"):
        return val.date()
    if isinstance(val, date):
        return val
    return None


def _extract_guest_name(summary: str, platform: Optional[str]) -> Optional[str]:
    """
    Extraire le nom du voyageur depuis le SUMMARY selon la plateforme.
    - Airbnb  : "CLOSED - Sophie Martin" → "Sophie Martin"
    - Booking : "Reservation - Jean P." → "Jean P."
    - Abritel : "Sophie Martin" → "Sophie Martin"
    """
    if not summary:
        return None
    s = summary.strip()
    # Airbnb format: "CLOSED - Name" ou "Reserved" (pas de nom)
    if "CLOSED" in s.upper() or s.upper() == "RESERVED":
        return None
    # Strip common prefixes
    for prefix in ["Reservation - ", "Réservation - ", "CLOSED - ", "Booking - "]:
        if s.startswith(prefix):
            s = s[len(prefix):].strip()
    return s or None


# ── Core sync function ─────────────────────────────────────────

async def sync_single_feed(feed: IcalFeed, db: AsyncSession) -> dict:
    """
    Synchronise un flux iCal unique.
    - Télécharge le fichier .ics
    - Parse les VEVENT
    - Crée CalendarEvent + Reservation si nouveaux (déduplication par source_uid)
    - Met à jour le statut du feed
    Retourne {"synced": int, "skipped": int, "status": str}
    """
    synced = 0
    skipped = 0

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(feed.feed_url, headers={"User-Agent": "HOSTPRO/1.0 iCal-Sync"})
            resp.raise_for_status()

        cal = Calendar.from_ical(resp.content)

        for component in cal.walk():
            if component.name != "VEVENT":
                continue

            uid = str(component.get("uid", uuid_lib.uuid4()))
            dtstart = _to_date(component.get("dtstart").dt if component.get("dtstart") else None)
            dtend   = _to_date(component.get("dtend").dt   if component.get("dtend")   else None)
            summary = str(component.get("summary", "Réservation externe"))

            if not dtstart or not dtend:
                continue

            # Déduplication — éviter de réimporter le même événement
            existing_event = await db.scalar(
                select(CalendarEvent).where(
                    CalendarEvent.source_uid == uid,
                    CalendarEvent.property_id == feed.property_id,
                )
            )
            if existing_event:
                skipped += 1
                continue

            # ── Créer le CalendarEvent ─────────────────────────
            color_map = {
                "airbnb":  "#FF5A5F",
                "booking": "#003580",
                "abritel": "#00B9E8",
            }
            event = CalendarEvent(
                tenant_id=feed.tenant_id,
                property_id=feed.property_id,
                event_type="reservation",
                start_date=dtstart,
                end_date=dtend,
                title=summary,
                color=color_map.get(feed.platform or "", "#717171"),
                source=feed.platform or "ical",
                source_uid=uid,
            )
            db.add(event)

            # ── Créer la Reservation correspondante ────────────
            # On ne crée pas une réservation pour les blocages Airbnb ("CLOSED / RESERVED")
            guest_name = _extract_guest_name(summary, feed.platform)
            is_block = summary.upper() in ("CLOSED", "RESERVED", "BLOCKED", "NOT AVAILABLE")

            if not is_block:
                # Chercher ou créer le guest
                guest: Optional[Guest] = None
                if guest_name:
                    guest = await db.scalar(
                        select(Guest).where(
                            Guest.tenant_id == feed.tenant_id,
                            Guest.full_name == guest_name,
                        )
                    )
                    if not guest:
                        guest = Guest(
                            tenant_id=feed.tenant_id,
                            full_name=guest_name,
                        )
                        db.add(guest)
                        await db.flush()

                nights = (dtend - dtstart).days
                reservation = Reservation(
                    tenant_id=feed.tenant_id,
                    property_id=feed.property_id,
                    guest_id=guest.id if guest else None,
                    source=feed.platform or "ical",
                    source_ref_id=uid,
                    check_in=dtstart,
                    check_out=dtend,
                    status="confirmed",
                    adults=1,
                    notes_internal=f"Importé automatiquement depuis {feed.platform or 'iCal'} le {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}",
                )
                db.add(reservation)
                # Lier l'event à la réservation
                await db.flush()
                event.reservation_id = reservation.id

            synced += 1

        # Mettre à jour le statut du feed
        feed.last_synced_at = datetime.now(timezone.utc)
        feed.sync_status = "success"
        feed.error_message = None
        await db.commit()

        logger.info(f"[iCal] Feed {feed.id} ({feed.platform}) — {synced} new, {skipped} skipped")
        return {"synced": synced, "skipped": skipped, "status": "success"}

    except httpx.HTTPStatusError as e:
        msg = f"HTTP {e.response.status_code} — URL inaccessible"
        feed.sync_status = "error"
        feed.error_message = msg
        await db.commit()
        logger.warning(f"[iCal] Feed {feed.id} error: {msg}")
        return {"synced": 0, "skipped": 0, "status": "error", "error": msg}

    except Exception as e:
        msg = str(e)[:500]
        feed.sync_status = "error"
        feed.error_message = msg
        await db.commit()
        logger.error(f"[iCal] Feed {feed.id} unexpected error: {msg}")
        return {"synced": 0, "skipped": 0, "status": "error", "error": msg}


# ── Sync all feeds ─────────────────────────────────────────────

async def sync_all_feeds() -> dict:
    """Synchronise tous les feeds actifs (direction=import). Appelé par le scheduler."""
    results = {"total": 0, "success": 0, "error": 0}
    async with AsyncSessionLocal() as db:
        feeds = await db.scalars(
            select(IcalFeed).where(IcalFeed.direction == "import")
        )
        for feed in feeds.all():
            r = await sync_single_feed(feed, db)
            results["total"] += 1
            if r["status"] == "success":
                results["success"] += 1
            else:
                results["error"] += 1
    return results


# ── Background scheduler loop ──────────────────────────────────

SYNC_INTERVAL_SECONDS = 15 * 60  # 15 minutes

async def auto_sync_loop():
    """Boucle background — sync iCal toutes les 15 minutes."""
    logger.info("[iCal] Scheduler démarré — sync toutes les 15 minutes")
    while True:
        try:
            await asyncio.sleep(SYNC_INTERVAL_SECONDS)
            logger.info("[iCal] Lancement sync automatique...")
            result = await sync_all_feeds()
            logger.info(f"[iCal] Sync terminée — {result}")
        except asyncio.CancelledError:
            logger.info("[iCal] Scheduler arrêté.")
            break
        except Exception as e:
            logger.error(f"[iCal] Erreur scheduler: {e}")
            await asyncio.sleep(60)  # Retry après 1 min si erreur

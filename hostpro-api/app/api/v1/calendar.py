from fastapi import APIRouter, Depends, HTTPException, Query, Response, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone
import httpx

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, get_subscription, check_limit
from app.models.calendar import CalendarEvent, IcalFeed
from app.models.reservation import Reservation
from app.models.user import User
from app.models.tenant import Tenant, Subscription
from sqlalchemy import func as sql_func
from pydantic import BaseModel
from icalendar import Calendar, Event as ICalEvent
import uuid as uuid_lib

router = APIRouter(prefix="/calendar", tags=["calendar"])


# ── Schemas ────────────────────────────────────────────────────

class BlockCreate(BaseModel):
    property_id: UUID
    start_date: date
    end_date: date
    title: Optional[str] = "Blocage"
    reason: Optional[str] = None


class IcalFeedCreate(BaseModel):
    property_id: UUID
    platform: Optional[str] = None
    feed_url: str
    direction: str = "import"


class IcalFeedOut(BaseModel):
    id: UUID
    property_id: UUID
    platform: Optional[str] = None
    feed_url: str
    direction: str
    sync_status: str
    last_synced_at: Optional[datetime] = None
    error_message: Optional[str] = None
    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: UUID
    property_id: UUID
    reservation_id: Optional[UUID] = None
    event_type: str
    start_date: date
    end_date: date
    title: Optional[str] = None
    color: Optional[str] = None
    source: str
    model_config = {"from_attributes": True}


# ── Calendar events ────────────────────────────────────────────

@router.get("", response_model=List[EventOut])
async def get_calendar(
    start: date = Query(...),
    end: date = Query(...),
    property_ids: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(CalendarEvent).where(
        CalendarEvent.tenant_id == tenant.id,
        CalendarEvent.start_date <= end,
        CalendarEvent.end_date >= start,
    )
    if property_ids:
        ids = [UUID(x.strip()) for x in property_ids.split(",")]
        q = q.where(CalendarEvent.property_id.in_(ids))
    result = await db.scalars(q.order_by(CalendarEvent.start_date))
    return result.all()


@router.post("/block", response_model=EventOut, status_code=201)
async def create_block(
    data: BlockCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    event = CalendarEvent(
        tenant_id=tenant.id,
        property_id=data.property_id,
        event_type="block",
        start_date=data.start_date,
        end_date=data.end_date,
        title=data.title or "Blocage",
        color="#6B7280",
        source="manual",
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=204)
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    event = await db.scalar(select(CalendarEvent).where(
        CalendarEvent.id == event_id,
        CalendarEvent.tenant_id == tenant.id,
    ))
    if not event:
        raise HTTPException(404)
    await db.delete(event)
    await db.commit()


# ── iCal export (HOSTPRO → plateforme) ────────────────────────

@router.get("/ical/{property_id}.ics")
async def export_ical(
    property_id: UUID,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Exporte le calendrier HOSTPRO en format iCal — à coller dans Airbnb/Booking."""
    events = await db.scalars(
        select(CalendarEvent).where(
            CalendarEvent.property_id == property_id,
            CalendarEvent.tenant_id == tenant.id,
        )
    )
    cal = Calendar()
    cal.add("prodid", "-//HOST PRO//hostpro.fr//FR")
    cal.add("version", "2.0")
    cal.add("x-wr-calname", "HOSTPRO Calendar")
    for e in events.all():
        ie = ICalEvent()
        ie.add("summary", e.title or e.event_type)
        ie.add("dtstart", e.start_date)
        ie.add("dtend", e.end_date)
        ie.add("uid", str(e.id))
        ie.add("dtstamp", datetime.now(timezone.utc))
        cal.add_component(ie)
    return Response(
        content=cal.to_ical(),
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=hostpro-{property_id}.ics"},
    )


# ── iCal feeds CRUD ────────────────────────────────────────────

@router.get("/ical-feeds", response_model=List[IcalFeedOut])
async def list_ical_feeds(
    property_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Liste tous les flux iCal du tenant (filtre optionnel par propriété)."""
    q = select(IcalFeed).where(IcalFeed.tenant_id == tenant.id)
    if property_id:
        q = q.where(IcalFeed.property_id == property_id)
    result = await db.scalars(q.order_by(IcalFeed.created_at.desc()))
    return result.all()


@router.post("/ical-feeds", response_model=IcalFeedOut, status_code=201)
async def create_ical_feed(
    data: IcalFeedCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    sub: Subscription | None = Depends(get_subscription),
    db: AsyncSession = Depends(get_db),
):
    """Enregistre un nouveau flux iCal et lance une première sync en arrière-plan."""
    # ── Vérification limite feeds iCal par propriété ────────────────────────
    feeds_for_prop = await db.scalar(
        select(sql_func.count()).where(
            IcalFeed.tenant_id == tenant.id,
            IcalFeed.property_id == data.property_id,
            IcalFeed.direction == "import",
        )
    )
    await check_limit(tenant, sub, "ical_feeds_limit", feeds_for_prop,
        error_msg="Limite de connexions iCal par propriété atteinte pour votre plan. "
                  "Passez à un plan supérieur pour connecter davantage de plateformes.")

    # Vérifier qu'il n'existe pas déjà le même feed pour cette propriété/plateforme
    existing = await db.scalar(
        select(IcalFeed).where(
            IcalFeed.tenant_id == tenant.id,
            IcalFeed.property_id == data.property_id,
            IcalFeed.platform == data.platform,
            IcalFeed.direction == data.direction,
        )
    )
    if existing:
        # Mise à jour de l'URL si le feed existe déjà
        existing.feed_url = data.feed_url
        existing.sync_status = "pending"
        await db.commit()
        await db.refresh(existing)
        feed = existing
    else:
        feed = IcalFeed(tenant_id=tenant.id, **data.model_dump())
        db.add(feed)
        await db.commit()
        await db.refresh(feed)

    # Première sync immédiate en background
    async def _bg_sync(feed_id: UUID):
        from app.services.ical_sync import sync_single_feed
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as bg_db:
            f = await bg_db.scalar(select(IcalFeed).where(IcalFeed.id == feed_id))
            if f:
                await sync_single_feed(f, bg_db)

    background_tasks.add_task(_bg_sync, feed.id)
    return feed


@router.get("/ical-feeds/{feed_id}", response_model=IcalFeedOut)
async def get_ical_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    feed = await db.scalar(select(IcalFeed).where(
        IcalFeed.id == feed_id,
        IcalFeed.tenant_id == tenant.id,
    ))
    if not feed:
        raise HTTPException(404, "Flux iCal introuvable")
    return feed


@router.delete("/ical-feeds/{feed_id}", status_code=204)
async def delete_ical_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Supprime un flux iCal (les réservations déjà importées sont conservées)."""
    feed = await db.scalar(select(IcalFeed).where(
        IcalFeed.id == feed_id,
        IcalFeed.tenant_id == tenant.id,
    ))
    if not feed:
        raise HTTPException(404, "Flux iCal introuvable")
    await db.delete(feed)
    await db.commit()


@router.post("/ical-feeds/{feed_id}/sync")
async def sync_ical_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Déclenche une synchronisation manuelle d'un flux iCal."""
    feed = await db.scalar(select(IcalFeed).where(
        IcalFeed.id == feed_id,
        IcalFeed.tenant_id == tenant.id,
    ))
    if not feed:
        raise HTTPException(404, "Flux iCal introuvable")

    from app.services.ical_sync import sync_single_feed
    result = await sync_single_feed(feed, db)

    if result["status"] == "error":
        raise HTTPException(500, result.get("error", "Erreur de synchronisation"))

    return result


@router.post("/ical-feeds/sync-all")
async def sync_all_feeds_endpoint(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Synchronise tous les flux iCal du tenant en une seule requête."""
    feeds = await db.scalars(
        select(IcalFeed).where(
            IcalFeed.tenant_id == tenant.id,
            IcalFeed.direction == "import",
        )
    )
    results = []
    from app.services.ical_sync import sync_single_feed
    for feed in feeds.all():
        r = await sync_single_feed(feed, db)
        results.append({"feed_id": str(feed.id), "platform": feed.platform, **r})
    return {"feeds": results, "total": len(results)}

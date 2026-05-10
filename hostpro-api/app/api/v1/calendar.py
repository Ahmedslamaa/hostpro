from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone
import httpx

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant
from app.models.calendar import CalendarEvent, IcalFeed
from app.models.reservation import Reservation
from app.models.user import User
from app.models.tenant import Tenant
from pydantic import BaseModel
from icalendar import Calendar, Event as ICalEvent
import uuid as uuid_lib

router = APIRouter(prefix="/calendar", tags=["calendar"])


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
    event = await db.scalar(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.tenant_id == tenant.id))
    if not event:
        raise HTTPException(404)
    await db.delete(event)
    await db.commit()


@router.get("/ical/{property_id}.ics")
async def export_ical(
    property_id: UUID,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    events = await db.scalars(
        select(CalendarEvent).where(
            CalendarEvent.property_id == property_id,
            CalendarEvent.tenant_id == tenant.id,
        )
    )
    cal = Calendar()
    cal.add("prodid", "-//HOST PRO//hostpro.fr//FR")
    cal.add("version", "2.0")
    for e in events.all():
        ie = ICalEvent()
        ie.add("summary", e.title or e.event_type)
        ie.add("dtstart", e.start_date)
        ie.add("dtend", e.end_date)
        ie.add("uid", str(e.id))
        cal.add_component(ie)
    return Response(content=cal.to_ical(), media_type="text/calendar")


@router.post("/ical-feeds", status_code=201)
async def create_ical_feed(
    data: IcalFeedCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    feed = IcalFeed(tenant_id=tenant.id, **data.model_dump())
    db.add(feed)
    await db.commit()
    await db.refresh(feed)
    return {"id": str(feed.id), "message": "Flux iCal ajouté"}


@router.post("/ical-feeds/{feed_id}/sync")
async def sync_ical_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    feed = await db.scalar(select(IcalFeed).where(IcalFeed.id == feed_id, IcalFeed.tenant_id == tenant.id))
    if not feed:
        raise HTTPException(404)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(feed.feed_url)
            resp.raise_for_status()

        cal = Calendar.from_ical(resp.content)
        count = 0
        for component in cal.walk():
            if component.name == "VEVENT":
                uid = str(component.get("uid", uuid_lib.uuid4()))
                dtstart = component.get("dtstart").dt
                dtend = component.get("dtend").dt
                summary = str(component.get("summary", "Réservation externe"))

                if hasattr(dtstart, "date"):
                    dtstart = dtstart.date()
                if hasattr(dtend, "date"):
                    dtend = dtend.date()

                existing = await db.scalar(
                    select(CalendarEvent).where(
                        CalendarEvent.source_uid == uid,
                        CalendarEvent.property_id == feed.property_id,
                    )
                )
                if not existing:
                    event = CalendarEvent(
                        tenant_id=tenant.id,
                        property_id=feed.property_id,
                        event_type="reservation",
                        start_date=dtstart,
                        end_date=dtend,
                        title=summary,
                        source=feed.platform or "ical",
                        source_uid=uid,
                    )
                    db.add(event)
                    count += 1

        feed.last_synced_at = datetime.now(timezone.utc)
        feed.sync_status = "success"
        feed.error_message = None
        await db.commit()
        return {"synced": count, "status": "success"}

    except Exception as e:
        feed.sync_status = "error"
        feed.error_message = str(e)
        await db.commit()
        raise HTTPException(500, f"Erreur de synchronisation : {str(e)}")

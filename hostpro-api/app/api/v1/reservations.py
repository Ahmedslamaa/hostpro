from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, check_permission
from app.models.reservation import Reservation, Guest
from app.models.calendar import CalendarEvent
from app.models.compliance import ComplianceRecord, NuiteesHistory
from app.models.task import Task
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationOut, GuestCreate, GuestOut

router = APIRouter(prefix="/reservations", tags=["reservations"])


async def check_availability(db: AsyncSession, property_id: UUID, check_in: date, check_out: date, exclude_id: UUID = None):
    q = select(CalendarEvent).where(
        CalendarEvent.property_id == property_id,
        CalendarEvent.start_date < check_out,
        CalendarEvent.end_date > check_in,
    )
    if exclude_id:
        q = q.where(CalendarEvent.reservation_id != exclude_id)
    conflict = await db.scalar(q)
    return conflict is None


@router.get("", response_model=List[ReservationOut])
async def list_reservations(
    property_id: Optional[UUID] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Reservation).where(Reservation.tenant_id == tenant.id)
    if property_id:
        q = q.where(Reservation.property_id == property_id)
    if status:
        q = q.where(Reservation.status == status)
    if start_date:
        q = q.where(Reservation.check_out >= start_date)
    if end_date:
        q = q.where(Reservation.check_in <= end_date)
    result = await db.scalars(q.order_by(Reservation.check_in.asc()))
    return result.all()


@router.post("", response_model=ReservationOut, status_code=201)
async def create_reservation(
    data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "reservations:write")
    if data.check_in >= data.check_out:
        raise HTTPException(400, "check_out doit être après check_in")

    available = await check_availability(db, data.property_id, data.check_in, data.check_out)
    if not available:
        raise HTTPException(409, "Ce bien est déjà réservé sur cette période")

    # Create guest inline if needed
    guest_id = data.guest_id
    if not guest_id and data.guest:
        g = Guest(tenant_id=tenant.id, **data.guest.model_dump())
        db.add(g)
        await db.flush()
        guest_id = g.id

    reservation_data = data.model_dump(exclude={"guest", "guest_id"})
    reservation = Reservation(tenant_id=tenant.id, guest_id=guest_id, **reservation_data)
    db.add(reservation)
    await db.flush()

    # Create calendar event
    event = CalendarEvent(
        tenant_id=tenant.id,
        property_id=data.property_id,
        reservation_id=reservation.id,
        event_type="reservation",
        start_date=data.check_in,
        end_date=data.check_out,
        title=f"Réservation {data.source}",
        source=data.source,
    )
    db.add(event)

    # Update nuitees counter
    nights = (data.check_out - data.check_in).days
    year = data.check_in.year
    compliance = await db.scalar(
        select(ComplianceRecord).where(ComplianceRecord.property_id == data.property_id)
    )
    if compliance:
        if compliance.current_year != year:
            compliance.nuitees_year = 0
            compliance.current_year = year
        compliance.nuitees_year += nights
        history = NuiteesHistory(
            tenant_id=tenant.id,
            property_id=data.property_id,
            compliance_record_id=compliance.id,
            reservation_id=reservation.id,
            year=year,
            nuitees_count=nights,
            check_in=data.check_in,
            check_out=data.check_out,
            created_at=datetime.now(timezone.utc),
        )
        db.add(history)

    # Auto-create cleaning task
    cleaning = Task(
        tenant_id=tenant.id,
        property_id=data.property_id,
        reservation_id=reservation.id,
        task_type="cleaning",
        title=f"Ménage après check-out",
        due_date=data.check_out,
        status="pending",
        priority="high",
        created_by=current_user.id,
    )
    db.add(cleaning)

    await db.commit()
    await db.refresh(reservation)

    # Email notification nouvelle réservation
    try:
        from app.services.email import send_email, email_new_reservation
        from app.models.property import Property
        import asyncio
        prop = await db.scalar(select(Property).where(Property.id == data.property_id))
        guest_name = "Voyageur"
        if guest_id:
            from app.models.reservation import Guest
            g = await db.scalar(select(Guest).where(Guest.id == guest_id))
            if g:
                guest_name = g.full_name
        if prop and current_user.email:
            asyncio.create_task(send_email(
                to=current_user.email,
                subject=f"Nouvelle réservation — {prop.name}",
                html=email_new_reservation(
                    guest_name=guest_name,
                    property_name=prop.name,
                    check_in=str(data.check_in),
                    check_out=str(data.check_out),
                    nights=nights,
                    total=float(reservation.total_price or 0),
                    source=data.source,
                ),
            ))
    except Exception:
        pass

    return reservation


@router.get("/{reservation_id}", response_model=ReservationOut)
async def get_reservation(
    reservation_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    r = await db.scalar(select(Reservation).where(Reservation.id == reservation_id, Reservation.tenant_id == tenant.id))
    if not r:
        raise HTTPException(404, "Réservation introuvable")
    return r


@router.patch("/{reservation_id}", response_model=ReservationOut)
async def update_reservation(
    reservation_id: UUID,
    data: ReservationUpdate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "reservations:write")
    r = await db.scalar(select(Reservation).where(Reservation.id == reservation_id, Reservation.tenant_id == tenant.id))
    if not r:
        raise HTTPException(404, "Réservation introuvable")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(r, k, v)
    await db.commit()
    await db.refresh(r)
    return r


@router.post("/{reservation_id}/checkin", response_model=ReservationOut)
async def do_checkin(
    reservation_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "reservations:write")
    r = await db.scalar(select(Reservation).where(Reservation.id == reservation_id, Reservation.tenant_id == tenant.id))
    if not r:
        raise HTTPException(404)
    r.check_in_done = True
    await db.commit()
    await db.refresh(r)
    return r


@router.post("/{reservation_id}/checkout", response_model=ReservationOut)
async def do_checkout(
    reservation_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "reservations:write")
    r = await db.scalar(select(Reservation).where(Reservation.id == reservation_id, Reservation.tenant_id == tenant.id))
    if not r:
        raise HTTPException(404)
    r.check_out_done = True
    r.status = "completed"
    await db.commit()
    await db.refresh(r)
    return r


# Guests
@router.get("/guests/list", response_model=List[GuestOut])
async def list_guests(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.scalars(select(Guest).where(Guest.tenant_id == tenant.id).order_by(Guest.created_at.desc()))
    return result.all()

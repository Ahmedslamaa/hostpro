from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import date, datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant
from app.models.reservation import Reservation
from app.models.property import Property
from app.models.task import Task
from app.models.compliance import ComplianceRecord
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.dashboard import KPIResponse, DashboardResponse, UpcomingItem, AlertItem, RevenuePoint

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(
    period: str = Query("month", regex="^(month|quarter|year)$"),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    if period == "month":
        start = date(now.year, now.month, 1)
        end = date.today()
        label = f"{now.strftime('%B %Y')}"
    elif period == "quarter":
        q_start_month = ((now.month - 1) // 3) * 3 + 1
        start = date(now.year, q_start_month, 1)
        end = date.today()
        label = f"T{(now.month - 1) // 3 + 1} {now.year}"
    else:
        start = date(now.year, 1, 1)
        end = date.today()
        label = str(now.year)

    reservations = await db.scalars(
        select(Reservation).where(
            Reservation.tenant_id == tenant.id,
            Reservation.status.in_(["confirmed", "completed"]),
            Reservation.check_in >= start,
            Reservation.check_in <= end,
        )
    )
    reservations = reservations.all()

    total_revenue = sum(float(r.net_revenue or r.total_amount or 0) for r in reservations)
    total_nights = sum(r.nights for r in reservations)

    props = await db.scalars(select(Property).where(Property.tenant_id == tenant.id, Property.status == "active"))
    props = props.all()
    active_count = len(props)

    period_days = (end - start).days + 1
    total_available_nights = active_count * period_days
    occupancy_rate = round((total_nights / total_available_nights * 100), 1) if total_available_nights > 0 else 0
    adr = round(total_revenue / total_nights, 2) if total_nights > 0 else 0
    revpar = round(total_revenue / total_available_nights, 2) if total_available_nights > 0 else 0

    return KPIResponse(
        occupancy_rate=occupancy_rate,
        total_revenue=total_revenue,
        adr=adr,
        revpar=revpar,
        total_reservations=len(reservations),
        active_properties=active_count,
        period=label,
    )


@router.get("/upcoming")
async def get_upcoming(
    days: int = Query(14, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    end = today + timedelta(days=days)

    result = await db.scalars(
        select(Reservation).where(
            Reservation.tenant_id == tenant.id,
            Reservation.check_in >= today,
            Reservation.check_in <= end,
            Reservation.status.in_(["confirmed", "pending"]),
        ).order_by(Reservation.check_in)
    )
    items = []
    for r in result.all():
        prop = await db.scalar(select(Property).where(Property.id == r.property_id))
        guest_name = None
        if r.guest_id:
            from app.models.reservation import Guest
            g = await db.scalar(select(Guest).where(Guest.id == r.guest_id))
            guest_name = g.full_name if g else None
        items.append(UpcomingItem(
            reservation_id=str(r.id),
            property_name=prop.name if prop else "Bien inconnu",
            guest_name=guest_name,
            check_in=r.check_in,
            check_out=r.check_out,
            nights=r.nights,
            source=r.source,
            status=r.status,
        ))
    return items


@router.get("/alerts")
async def get_alerts(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    records = await db.scalars(select(ComplianceRecord).where(ComplianceRecord.tenant_id == tenant.id))
    alerts = []
    today = date.today()
    year = today.year

    for r in records.all():
        prop = await db.scalar(select(Property).where(Property.id == r.property_id))
        prop_name = prop.name if prop else "Bien inconnu"

        if r.current_year == year and r.nuitees_year >= r.nuitees_alert_at:
            severity = "critical" if r.nuitees_year >= r.nuitees_limit else "warning"
            alerts.append(AlertItem(
                type="nuitees",
                severity=severity,
                property_id=str(r.property_id),
                property_name=prop_name,
                message=f"{r.nuitees_year}/{r.nuitees_limit} nuitées utilisées",
            ))
        if not r.registration_number:
            alerts.append(AlertItem(
                type="registration",
                severity="warning",
                property_id=str(r.property_id),
                property_name=prop_name,
                message="Numéro d'enregistrement manquant",
            ))
        if r.dpe_expiry and r.dpe_expiry < today:
            alerts.append(AlertItem(
                type="dpe",
                severity="critical",
                property_id=str(r.property_id),
                property_name=prop_name,
                message="DPE expiré",
            ))

    return alerts


@router.get("/revenue")
async def get_revenue(
    months: int = Query(6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    points = []
    for i in range(months - 1, -1, -1):
        month_date = now - relativedelta(months=i)
        start = date(month_date.year, month_date.month, 1)
        if month_date.month == 12:
            end = date(month_date.year + 1, 1, 1)
        else:
            end = date(month_date.year, month_date.month + 1, 1)

        result = await db.scalars(
            select(Reservation).where(
                Reservation.tenant_id == tenant.id,
                Reservation.check_in >= start,
                Reservation.check_in < end,
                Reservation.status.in_(["confirmed", "completed"]),
            )
        )
        revs = result.all()
        revenue = sum(float(r.net_revenue or r.total_amount or 0) for r in revs)
        points.append(RevenuePoint(
            month=month_date.strftime("%b %Y"),
            revenue=revenue,
            reservations=len(revs),
        ))
    return points

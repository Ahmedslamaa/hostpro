from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant
from app.models.compliance import ComplianceRecord, NuiteesHistory
from app.models.property import Property
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.compliance import ComplianceUpdate, ComplianceOut, NuiteesOut

router = APIRouter(prefix="/compliance", tags=["compliance"])


async def get_or_create_compliance(db: AsyncSession, property_id: UUID, tenant_id: UUID) -> ComplianceRecord:
    record = await db.scalar(select(ComplianceRecord).where(ComplianceRecord.property_id == property_id))
    if not record:
        record = ComplianceRecord(
            tenant_id=tenant_id,
            property_id=property_id,
            current_year=datetime.now(timezone.utc).year,
        )
        db.add(record)
        await db.flush()
    return record


def compute_alerts(record: ComplianceRecord) -> list:
    alerts = []
    year = datetime.now(timezone.utc).year
    if record.current_year == year:
        if record.nuitees_year >= record.nuitees_limit:
            alerts.append(f"LIMITE ATTEINTE : {record.nuitees_year}/{record.nuitees_limit} nuitées en {year}")
        elif record.nuitees_year >= record.nuitees_alert_at:
            alerts.append(f"ALERTE : {record.nuitees_year}/{record.nuitees_limit} nuitées — seuil approché")
    if not record.registration_number:
        alerts.append("Numéro d'enregistrement manquant")
    if record.dpe_class in ["F", "G"]:
        alerts.append(f"DPE classe {record.dpe_class} — location interdite après 2028")
    if record.dpe_expiry and record.dpe_expiry < date.today():
        alerts.append("DPE expiré")
    if record.registration_expiry and record.registration_expiry < date.today():
        alerts.append("Numéro d'enregistrement expiré")
    return alerts


@router.get("", response_model=List[ComplianceOut])
async def list_compliance(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    props = await db.scalars(select(Property).where(Property.tenant_id == tenant.id, Property.status == "active"))
    results = []
    for p in props.all():
        record = await get_or_create_compliance(db, p.id, tenant.id)
        record.alerts = compute_alerts(record)
        record.is_compliant = len(record.alerts) == 0
        results.append(record)
    await db.commit()
    return results


@router.get("/alerts")
async def get_all_alerts(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    records = await db.scalars(select(ComplianceRecord).where(ComplianceRecord.tenant_id == tenant.id))
    alerts = []
    for r in records.all():
        computed = compute_alerts(r)
        if computed:
            prop = await db.scalar(select(Property).where(Property.id == r.property_id))
            for a in computed:
                alerts.append({
                    "property_id": str(r.property_id),
                    "property_name": prop.name if prop else "Bien inconnu",
                    "alert": a,
                    "severity": "critical" if "LIMITE" in a or "interdit" in a else "warning",
                })
    return alerts


@router.get("/{property_id}", response_model=ComplianceOut)
async def get_compliance(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404, "Bien introuvable")
    record = await get_or_create_compliance(db, property_id, tenant.id)
    record.alerts = compute_alerts(record)
    record.is_compliant = len(record.alerts) == 0
    await db.commit()
    return record


@router.patch("/{property_id}", response_model=ComplianceOut)
async def update_compliance(
    property_id: UUID,
    data: ComplianceUpdate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404)
    record = await get_or_create_compliance(db, property_id, tenant.id)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(record, k, v)
    record.updated_at = datetime.now(timezone.utc)
    record.last_checked_at = datetime.now(timezone.utc)
    record.alerts = compute_alerts(record)
    record.is_compliant = len(record.alerts) == 0
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{property_id}/nuitees", response_model=NuiteesOut)
async def get_nuitees(
    property_id: UUID,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    if not year:
        year = datetime.now(timezone.utc).year
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404)
    record = await get_or_create_compliance(db, property_id, tenant.id)
    total = record.nuitees_year if record.current_year == year else 0
    remaining = max(0, record.nuitees_limit - total)
    percentage = round((total / record.nuitees_limit) * 100, 1) if record.nuitees_limit > 0 else 0
    return NuiteesOut(
        property_id=property_id,
        year=year,
        total=total,
        limit=record.nuitees_limit,
        remaining=remaining,
        percentage=percentage,
        alert_threshold=record.nuitees_alert_at,
        is_alert=total >= record.nuitees_alert_at,
    )

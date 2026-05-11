from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import re

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, check_permission, get_subscription, check_limit
from app.models.property import Property, PropertyPhoto, Owner
from app.models.user import User
from app.models.tenant import Tenant, Subscription
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyOut, OwnerCreate, OwnerOut

router = APIRouter(prefix="/properties", tags=["properties"])


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r'[àáâãäå]', 'a', s)
    s = re.sub(r'[éèêë]', 'e', s)
    s = re.sub(r'[îï]', 'i', s)
    s = re.sub(r'[ôö]', 'o', s)
    s = re.sub(r'[ùûü]', 'u', s)
    s = re.sub(r'[ç]', 'c', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


@router.get("", response_model=List[PropertyOut])
async def list_properties(
    status: Optional[str] = None,
    city: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Property).where(Property.tenant_id == tenant.id)
    if status:
        q = q.where(Property.status == status)
    if city:
        q = q.where(Property.city.ilike(f"%{city}%"))
    result = await db.scalars(q.order_by(Property.created_at.desc()))
    return result.all()


@router.post("", response_model=PropertyOut, status_code=201)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    sub: Subscription | None = Depends(get_subscription),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:write")

    # ── Vérification limite du plan ─────────────────────────────────────────
    current_count = await db.scalar(
        select(func.count()).where(Property.tenant_id == tenant.id)
    )
    await check_limit(tenant, sub, "properties_limit", current_count,
        error_msg=f"Vous avez atteint la limite de biens de votre plan. "
                  f"Passez à un plan supérieur pour ajouter davantage de propriétés.")

    slug = slugify(data.name)
    slug_count = await db.scalar(select(func.count()).where(Property.tenant_id == tenant.id, Property.slug.like(f"{slug}%")))
    final_slug = f"{slug}-{slug_count + 1}" if slug_count > 0 else slug

    prop = Property(tenant_id=tenant.id, slug=final_slug, **data.model_dump(exclude_none=True))
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:read")
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404, "Bien introuvable")
    return prop


@router.patch("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: UUID,
    data: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:write")
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404, "Bien introuvable")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(prop, k, v)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:delete")
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404, "Bien introuvable")
    prop.status = "inactive"
    await db.commit()


# Owners
@router.get("/owners/list", response_model=List[OwnerOut])
async def list_owners(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.scalars(select(Owner).where(Owner.tenant_id == tenant.id))
    return result.all()


@router.post("/owners", response_model=OwnerOut, status_code=201)
async def create_owner(
    data: OwnerCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "owners:write")
    owner = Owner(tenant_id=tenant.id, **data.model_dump())
    db.add(owner)
    await db.commit()
    await db.refresh(owner)
    return owner

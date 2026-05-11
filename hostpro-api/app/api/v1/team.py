from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, check_permission, get_subscription, check_limit
from app.models.user import User, UserTenantMembership
from app.models.tenant import Tenant, Subscription
from app.core.security import hash_password
import uuid

router = APIRouter(prefix="/team", tags=["team"])


class MemberOut(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str | None
    role: str
    is_active: bool
    joined_at: datetime | None
    invited_at: datetime | None
    model_config = {"from_attributes": True}


class InviteCreate(BaseModel):
    email: str
    full_name: str
    role: str = "manager"
    password: Optional[str] = "HostPro2024!"


class RoleUpdate(BaseModel):
    role: str


@router.get("", response_model=List[MemberOut])
async def list_members(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserTenantMembership, User)
        .join(User, UserTenantMembership.user_id == User.id)
        .where(UserTenantMembership.tenant_id == tenant.id)
        .order_by(UserTenantMembership.invited_at.desc().nulls_last())
    )
    rows = result.all()
    members = []
    for membership, user in rows:
        members.append(MemberOut(
            id=str(membership.id),
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=membership.role,
            is_active=membership.is_active,
            joined_at=membership.joined_at,
            invited_at=membership.invited_at,
        ))
    return members


@router.post("/invite", response_model=MemberOut, status_code=201)
async def invite_member(
    data: InviteCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    sub: Subscription | None = Depends(get_subscription),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "team:write")

    # ── Vérification limite membres du plan ─────────────────────────────────
    current_count = await db.scalar(
        select(func.count()).where(
            UserTenantMembership.tenant_id == tenant.id,
            UserTenantMembership.is_active == True,
        )
    )
    await check_limit(tenant, sub, "team_members_limit", current_count,
        error_msg="Limite de membres d'équipe atteinte pour votre plan. "
                  "Passez à un plan supérieur pour inviter davantage de collaborateurs.")

    # Check if user already exists
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing:
        # Check if already member
        already = await db.scalar(
            select(UserTenantMembership).where(
                UserTenantMembership.user_id == existing.id,
                UserTenantMembership.tenant_id == tenant.id,
            )
        )
        if already:
            already.is_active = True
            already.role = data.role
            await db.commit()
            return MemberOut(
                id=str(already.id), user_id=str(existing.id),
                email=existing.email, full_name=existing.full_name,
                role=already.role, is_active=already.is_active,
                joined_at=already.joined_at, invited_at=already.invited_at,
            )
        user = existing
    else:
        user = User(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password or "HostPro2024!"),
            is_active=True,
        )
        db.add(user)
        await db.flush()

    membership = UserTenantMembership(
        user_id=user.id,
        tenant_id=tenant.id,
        role=data.role,
        is_active=True,
        invited_at=datetime.now(timezone.utc),
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    return MemberOut(
        id=str(membership.id), user_id=str(user.id),
        email=user.email, full_name=user.full_name,
        role=membership.role, is_active=membership.is_active,
        joined_at=membership.joined_at, invited_at=membership.invited_at,
    )


@router.patch("/{member_id}/role", response_model=MemberOut)
async def update_role(
    member_id: UUID,
    data: RoleUpdate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "team:write")
    result = await db.execute(
        select(UserTenantMembership, User)
        .join(User, UserTenantMembership.user_id == User.id)
        .where(UserTenantMembership.id == member_id, UserTenantMembership.tenant_id == tenant.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Membre introuvable")
    membership, user = row
    membership.role = data.role
    await db.commit()
    return MemberOut(
        id=str(membership.id), user_id=str(user.id),
        email=user.email, full_name=user.full_name,
        role=membership.role, is_active=membership.is_active,
        joined_at=membership.joined_at, invited_at=membership.invited_at,
    )


@router.delete("/{member_id}", status_code=204)
async def remove_member(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "team:write")
    membership = await db.scalar(
        select(UserTenantMembership).where(
            UserTenantMembership.id == member_id,
            UserTenantMembership.tenant_id == tenant.id,
        )
    )
    if not membership:
        raise HTTPException(404)
    membership.is_active = False
    await db.commit()

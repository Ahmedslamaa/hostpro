from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserTenantMembership
from app.models.tenant import Tenant, Subscription
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut, MeResponse, TenantMini, RefreshRequest, SubscriptionInfo
from app.core.plans import get_plan_features

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing:
        raise HTTPException(400, "Email déjà utilisé")

    slug_exists = await db.scalar(select(Tenant).where(Tenant.slug == data.tenant_slug))
    if slug_exists:
        raise HTTPException(400, "Ce slug est déjà pris")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.flush()

    tenant = Tenant(slug=data.tenant_slug, name=data.tenant_name)
    db.add(tenant)
    await db.flush()

    membership = UserTenantMembership(
        user_id=user.id,
        tenant_id=tenant.id,
        role="admin",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(membership)

    sub = Subscription(
        tenant_id=tenant.id,
        plan="trial",
        status="trialing",
        properties_limit=5,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(user)

    # Email de bienvenue (async, non bloquant)
    try:
        from app.services.email import send_email, email_welcome
        import asyncio
        asyncio.create_task(send_email(
            to=user.email,
            subject=f"Bienvenue sur HOST PRO — {tenant.name}",
            html=email_welcome(user.full_name or user.email, tenant.name),
        ))
    except Exception:
        pass

    access_token = create_access_token({"sub": str(user.id), "tenant_id": str(tenant.id), "role": "admin"})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == data.email, User.is_active == True))
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identifiants incorrects")

    membership = await db.scalar(
        select(UserTenantMembership).where(
            UserTenantMembership.user_id == user.id,
            UserTenantMembership.is_active == True,
        )
    )
    tenant_id = str(membership.tenant_id) if membership else ""
    role = membership.role if membership else "admin"

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id), "tenant_id": tenant_id, "role": role})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Token de rafraîchissement invalide")

    user = await db.scalar(select(User).where(User.id == uuid.UUID(payload["sub"]), User.is_active == True))
    if not user:
        raise HTTPException(401, "Utilisateur introuvable")

    membership = await db.scalar(
        select(UserTenantMembership).where(
            UserTenantMembership.user_id == user.id, UserTenantMembership.is_active == True
        )
    )
    tenant_id = str(membership.tenant_id) if membership else ""
    role = membership.role if membership else "admin"

    access_token = create_access_token({"sub": str(user.id), "tenant_id": tenant_id, "role": role})
    new_refresh = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=MeResponse)
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    memberships = await db.scalars(
        select(UserTenantMembership).where(
            UserTenantMembership.user_id == current_user.id, UserTenantMembership.is_active == True
        )
    )
    tenants = []
    for m in memberships.all():
        tenant = await db.scalar(select(Tenant).where(Tenant.id == m.tenant_id))
        if not tenant:
            continue

        # Charger la souscription et construire SubscriptionInfo
        sub = await db.scalar(select(Subscription).where(Subscription.tenant_id == tenant.id))
        plan = sub.plan if sub else tenant.plan
        features = get_plan_features(plan)

        sub_info = SubscriptionInfo(
            plan=plan,
            status=sub.status if sub else "trialing",
            trial_end=sub.trial_end if sub else None,
            current_period_end=sub.current_period_end if sub else None,
            features=dict(features),
            properties_limit=features["properties_limit"],
            team_members_limit=features["team_members_limit"],
            ical_feeds_limit=features["ical_feeds_limit"],
        )

        tenants.append(TenantMini(
            id=tenant.id, name=tenant.name, slug=tenant.slug,
            role=m.role, subscription=sub_info,
        ))

    resp = MeResponse.model_validate(current_user)
    resp.tenants = tenants
    return resp


from pydantic import BaseModel as _BM
from typing import Optional as _Opt

class ProfileUpdate(_BM):
    full_name: _Opt[str] = None
    phone: _Opt[str] = None
    avatar_url: _Opt[str] = None

class PasswordChange(_BM):
    current_password: str
    new_password: str

@router.patch("/profile", response_model=UserOut)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    current_user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(400, "Mot de passe actuel incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Mot de passe modifié avec succès"}

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserTenantMembership
from app.models.tenant import Tenant, Subscription
from app.core.plans import (
    get_plan_features, plan_has_feature, plan_get_limit,
    is_within_limit, ACTIVE_STATUSES
)

bearer_scheme = HTTPBearer()

ROLE_PERMISSIONS = {
    "superadmin": {"*"},
    "admin": {
        "properties:read", "properties:write", "properties:delete",
        "reservations:read", "reservations:write", "reservations:delete",
        "tasks:read", "tasks:write", "tasks:delete",
        "messages:read", "messages:write",
        "compliance:read", "compliance:write",
        "team:read", "team:write", "team:delete",
        "dashboard:read",
        "billing:read", "billing:write",
        "owners:read", "owners:write",
    },
    "manager": {
        "properties:read", "properties:write",
        "reservations:read", "reservations:write",
        "tasks:read", "tasks:write",
        "messages:read", "messages:write",
        "compliance:read",
        "team:read",
        "dashboard:read",
        "owners:read",
    },
    "owner": {
        "properties:read",
        "reservations:read",
        "compliance:read",
        "dashboard:read",
    },
    "provider": {
        "tasks:read",
        "tasks:write",
    },
}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")

    result = await db.execute(select(User).where(User.id == UUID(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur introuvable")
    return user


async def get_current_tenant(
    x_tenant_id: Optional[str] = Header(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    if current_user.is_superadmin:
        if not x_tenant_id:
            raise HTTPException(status_code=400, detail="X-Tenant-Id requis pour superadmin")
        result = await db.execute(select(Tenant).where(Tenant.id == UUID(x_tenant_id)))
        tenant = result.scalar_one_or_none()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant introuvable")
        return tenant

    if not x_tenant_id:
        result = await db.execute(
            select(UserTenantMembership)
            .where(UserTenantMembership.user_id == current_user.id, UserTenantMembership.is_active == True)
        )
        membership = result.scalars().first()
        if not membership:
            raise HTTPException(status_code=403, detail="Aucun accès tenant")
        x_tenant_id = str(membership.tenant_id)

    result = await db.execute(
        select(UserTenantMembership)
        .where(
            UserTenantMembership.user_id == current_user.id,
            UserTenantMembership.tenant_id == UUID(x_tenant_id),
            UserTenantMembership.is_active == True,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Accès refusé à ce tenant")

    result = await db.execute(select(Tenant).where(Tenant.id == UUID(x_tenant_id), Tenant.is_active == True))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant introuvable")

    current_user._role = membership.role
    current_user._tenant_id = membership.tenant_id
    return tenant


def check_permission(current_user: User, permission: str) -> None:
    """Call this inline inside route handlers after get_current_tenant has run."""
    if current_user.is_superadmin:
        return
    role = getattr(current_user, "_role", "provider")
    perms = ROLE_PERMISSIONS.get(role, set())
    if "*" not in perms and permission not in perms:
        raise HTTPException(status_code=403, detail=f"Permission requise : {permission}")


def require_permission(permission: str):
    """Legacy Depends-based permission check — use check_permission() inline instead."""
    def checker(
        current_user: User = Depends(get_current_user),
        tenant: Tenant = Depends(get_current_tenant),
    ):
        check_permission(current_user, permission)
        return current_user
    return checker


# ═══════════════════════════════════════════════════════════════════════════
# Contrôle d'accès par abonnement
# ═══════════════════════════════════════════════════════════════════════════

async def get_subscription(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
) -> Subscription | None:
    """Charge la souscription active du tenant courant."""
    return await db.scalar(
        select(Subscription).where(Subscription.tenant_id == tenant.id)
    )


def _resolve_plan(tenant: Tenant, sub: Subscription | None) -> str:
    """Retourne le plan effectif (tenant.plan est la source de vérité)."""
    if sub and sub.status in ACTIVE_STATUSES:
        return sub.plan
    return tenant.plan  # fallback sur le plan du tenant


def check_feature(
    tenant: Tenant,
    sub: "Subscription | None",
    feature: str,
    error_msg: str | None = None,
) -> None:
    """
    Lève HTTP 403 si le plan actif n'inclut pas la feature demandée.
    Usage : check_feature(tenant, sub, "ai_pricing")
    """
    plan = _resolve_plan(tenant, sub)
    if not plan_has_feature(plan, feature):
        plan_features = get_plan_features(plan)
        msg = error_msg or (
            f"Fonctionnalité non disponible dans votre plan '{plan}'. "
            f"Passez à un plan supérieur pour accéder à cette fonctionnalité."
        )
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FEATURE_NOT_IN_PLAN",
                "feature": feature,
                "current_plan": plan,
                "message": msg,
            },
        )


async def check_limit(
    tenant: Tenant,
    sub: "Subscription | None",
    limit_key: str,
    current_count: int,
    error_msg: str | None = None,
) -> None:
    """
    Lève HTTP 403 si current_count a atteint la limite du plan.
    Usage : await check_limit(tenant, sub, "properties_limit", nb_biens)
    """
    plan = _resolve_plan(tenant, sub)
    limit = plan_get_limit(plan, limit_key)
    if limit != -1 and current_count >= limit:
        msg = error_msg or (
            f"Limite atteinte pour votre plan '{plan}' : "
            f"{limit} {limit_key.replace('_limit', '').replace('_', ' ')}(s) maximum. "
            f"Passez à un plan supérieur pour en ajouter davantage."
        )
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PLAN_LIMIT_REACHED",
                "limit_key": limit_key,
                "limit": limit,
                "current": current_count,
                "current_plan": plan,
                "message": msg,
            },
        )

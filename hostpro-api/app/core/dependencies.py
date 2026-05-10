from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserTenantMembership
from app.models.tenant import Tenant

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

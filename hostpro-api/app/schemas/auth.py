from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, Any


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    tenant_name: str
    tenant_slug: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str | None
    avatar_url: str | None
    is_superadmin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MeResponse(UserOut):
    tenants: list["TenantMini"] = []


class SubscriptionInfo(BaseModel):
    """Informations d'abonnement exposées au frontend."""
    plan: str                                  # trial | starter | pro | enterprise
    status: Optional[str] = None              # trialing | active | canceled | past_due
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    features: dict[str, Any] = {}             # toutes les features du plan
    properties_limit: int = 2
    team_members_limit: int = 2
    ical_feeds_limit: int = 1


class TenantMini(BaseModel):
    id: UUID
    name: str
    slug: str
    role: str
    subscription: Optional[SubscriptionInfo] = None

    model_config = {"from_attributes": True}

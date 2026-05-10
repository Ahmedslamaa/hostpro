from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


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


class TenantMini(BaseModel):
    id: UUID
    name: str
    slug: str
    role: str

    model_config = {"from_attributes": True}

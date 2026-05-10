from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional


class GuestCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    id_document: Optional[str] = None
    notes: Optional[str] = None


class GuestOut(GuestCreate):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class ReservationCreate(BaseModel):
    property_id: UUID
    guest_id: Optional[UUID] = None
    guest: Optional[GuestCreate] = None
    source: str = "manual"
    check_in: date
    check_out: date
    adults: int = 1
    children: int = 0
    total_amount: Optional[float] = None
    cleaning_fee: Optional[float] = None
    platform_fee: Optional[float] = None
    net_revenue: Optional[float] = None
    notes_internal: Optional[str] = None
    notes_guest: Optional[str] = None


class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    adults: Optional[int] = None
    children: Optional[int] = None
    total_amount: Optional[float] = None
    net_revenue: Optional[float] = None
    payment_status: Optional[str] = None
    notes_internal: Optional[str] = None
    notes_guest: Optional[str] = None
    check_in_done: Optional[bool] = None
    check_out_done: Optional[bool] = None


class ReservationOut(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    guest_id: Optional[UUID] = None
    source: str
    source_ref_id: Optional[str] = None
    check_in: date
    check_out: date
    nights: int
    status: str
    total_amount: Optional[float] = None
    cleaning_fee: Optional[float] = None
    platform_fee: Optional[float] = None
    net_revenue: Optional[float] = None
    payment_status: str
    adults: int
    children: int
    notes_internal: Optional[str] = None
    notes_guest: Optional[str] = None
    check_in_done: bool
    check_out_done: bool
    guest: Optional[GuestOut] = None
    created_at: datetime
    model_config = {"from_attributes": True}

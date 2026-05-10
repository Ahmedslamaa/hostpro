from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class OwnerCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class OwnerOut(OwnerCreate):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class PropertyPhotoOut(BaseModel):
    id: UUID
    url: str
    caption: Optional[str] = None
    position: int = 0
    is_cover: bool = False
    model_config = {"from_attributes": True}


class PropertyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    property_type: str = "apartment"
    owner_id: Optional[UUID] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "FR"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: int = 2
    bedrooms: int = 1
    bathrooms: int = 1
    surface_m2: Optional[float] = None
    min_stay_nights: int = 1
    max_stay_nights: Optional[int] = None
    check_in_time: str = "16:00"
    check_out_time: str = "11:00"
    base_price_night: Optional[float] = None
    cleaning_fee: float = 0
    security_deposit: float = 0
    amenities: List[str] = []
    house_rules: List[str] = []


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[UUID] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    surface_m2: Optional[float] = None
    min_stay_nights: Optional[int] = None
    max_stay_nights: Optional[int] = None
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    base_price_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    security_deposit: Optional[float] = None
    amenities: Optional[List[str]] = None
    house_rules: Optional[List[str]] = None


class PropertyOut(BaseModel):
    id: UUID
    tenant_id: UUID
    owner_id: Optional[UUID] = None
    name: str
    slug: str
    description: Optional[str] = None
    property_type: str
    status: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: int
    bedrooms: int
    bathrooms: int
    surface_m2: Optional[float] = None
    min_stay_nights: int
    max_stay_nights: Optional[int] = None
    check_in_time: str
    check_out_time: str
    base_price_night: Optional[float] = None
    cleaning_fee: float
    security_deposit: float
    amenities: List[str] = []
    house_rules: List[str] = []
    created_at: datetime
    model_config = {"from_attributes": True}

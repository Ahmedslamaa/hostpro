from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class KPIResponse(BaseModel):
    occupancy_rate: float
    total_revenue: float
    adr: float
    revpar: float
    total_reservations: int
    active_properties: int
    period: str


class RevenuePoint(BaseModel):
    month: str
    revenue: float
    reservations: int


class OccupancyPoint(BaseModel):
    property_id: str
    property_name: str
    occupancy_rate: float
    nights_booked: int
    nights_available: int


class UpcomingItem(BaseModel):
    reservation_id: str
    property_name: str
    guest_name: Optional[str] = None
    check_in: date
    check_out: date
    nights: int
    source: str
    status: str


class AlertItem(BaseModel):
    type: str
    severity: str
    property_id: str
    property_name: str
    message: str


class DashboardResponse(BaseModel):
    kpis: KPIResponse
    upcoming: List[UpcomingItem]
    alerts: List[AlertItem]
    pending_tasks: int
    urgent_tasks: int

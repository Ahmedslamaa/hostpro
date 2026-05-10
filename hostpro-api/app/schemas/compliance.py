from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List


class ComplianceUpdate(BaseModel):
    registration_number: Optional[str] = None
    registration_city: Optional[str] = None
    registration_expiry: Optional[date] = None
    nuitees_limit: Optional[int] = None
    nuitees_alert_at: Optional[int] = None
    dpe_class: Optional[str] = None
    dpe_expiry: Optional[date] = None
    dpe_value: Optional[float] = None
    fiscal_regime: Optional[str] = None
    siret: Optional[str] = None
    tva_number: Optional[str] = None


class ComplianceOut(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    registration_number: Optional[str] = None
    registration_city: Optional[str] = None
    registration_expiry: Optional[date] = None
    nuitees_year: int
    nuitees_limit: int
    nuitees_alert_at: int
    current_year: Optional[int] = None
    dpe_class: Optional[str] = None
    dpe_expiry: Optional[date] = None
    dpe_value: Optional[float] = None
    fiscal_regime: Optional[str] = None
    siret: Optional[str] = None
    tva_number: Optional[str] = None
    is_compliant: bool
    alerts: List[str] = []
    last_checked_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class NuiteesOut(BaseModel):
    property_id: UUID
    year: int
    total: int
    limit: int
    remaining: int
    percentage: float
    alert_threshold: int
    is_alert: bool

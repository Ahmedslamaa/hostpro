from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List


class TaskCreate(BaseModel):
    property_id: Optional[UUID] = None
    reservation_id: Optional[UUID] = None
    task_type: str = "other"
    title: str
    description: Optional[str] = None
    priority: str = "normal"
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: Optional[UUID] = None
    reservation_id: Optional[UUID] = None
    task_type: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    assigned_to: Optional[UUID] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class MessageTemplateCreate(BaseModel):
    name: str
    trigger: Optional[str] = None
    subject: Optional[str] = None
    body: str
    channel: str = "email"
    is_active: bool = True


class MessageTemplateOut(MessageTemplateCreate):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class ThreadCreate(BaseModel):
    property_id: Optional[UUID] = None
    reservation_id: Optional[UUID] = None
    guest_id: Optional[UUID] = None
    channel: str = "email"


class MessageCreate(BaseModel):
    content: str
    direction: str = "outbound"


class MessageOut(BaseModel):
    id: UUID
    thread_id: UUID
    direction: str
    content: str
    is_automated: bool
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class ThreadOut(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: Optional[UUID] = None
    reservation_id: Optional[UUID] = None
    guest_id: Optional[UUID] = None
    channel: str
    status: str
    last_message_at: Optional[datetime] = None
    messages: List[MessageOut] = []
    created_at: datetime
    model_config = {"from_attributes": True}

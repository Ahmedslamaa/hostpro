from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant
from app.models.message import MessageThread, Message, MessageTemplate
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.message import (
    ThreadCreate, ThreadOut, MessageCreate, MessageOut,
    MessageTemplateCreate, MessageTemplateOut
)

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/threads", response_model=List[ThreadOut])
async def list_threads(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(MessageThread).where(MessageThread.tenant_id == tenant.id)
    if status:
        q = q.where(MessageThread.status == status)
    result = await db.scalars(q.order_by(MessageThread.last_message_at.desc().nulls_last()))
    return result.all()


@router.post("/threads", response_model=ThreadOut, status_code=201)
async def create_thread(
    data: ThreadCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    thread = MessageThread(tenant_id=tenant.id, **data.model_dump())
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return thread


@router.get("/threads/{thread_id}", response_model=ThreadOut)
async def get_thread(
    thread_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    thread = await db.scalar(select(MessageThread).where(MessageThread.id == thread_id, MessageThread.tenant_id == tenant.id))
    if not thread:
        raise HTTPException(404)
    return thread


@router.post("/threads/{thread_id}/messages", response_model=MessageOut, status_code=201)
async def send_message(
    thread_id: UUID,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    thread = await db.scalar(select(MessageThread).where(MessageThread.id == thread_id, MessageThread.tenant_id == tenant.id))
    if not thread:
        raise HTTPException(404)

    now = datetime.now(timezone.utc)
    msg = Message(
        tenant_id=tenant.id,
        thread_id=thread_id,
        direction=data.direction,
        content=data.content,
        is_automated=False,
        sent_at=now,
        created_at=now,
    )
    db.add(msg)
    thread.last_message_at = now
    await db.commit()
    await db.refresh(msg)
    return msg


# Templates
@router.get("/templates", response_model=List[MessageTemplateOut])
async def list_templates(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.scalars(select(MessageTemplate).where(MessageTemplate.tenant_id == tenant.id))
    return result.all()


@router.post("/templates", response_model=MessageTemplateOut, status_code=201)
async def create_template(
    data: MessageTemplateCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    t = MessageTemplate(tenant_id=tenant.id, **data.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return t


@router.patch("/templates/{template_id}", response_model=MessageTemplateOut)
async def update_template(
    template_id: UUID,
    data: MessageTemplateCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    t = await db.scalar(select(MessageTemplate).where(MessageTemplate.id == template_id, MessageTemplate.tenant_id == tenant.id))
    if not t:
        raise HTTPException(404)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(t, k, v)
    await db.commit()
    await db.refresh(t)
    return t

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, check_permission
from app.models.task import Task
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskOut])
async def list_tasks(
    status: Optional[str] = None,
    task_type: Optional[str] = None,
    property_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Task).where(Task.tenant_id == tenant.id)
    if status:
        q = q.where(Task.status == status)
    if task_type:
        q = q.where(Task.task_type == task_type)
    if property_id:
        q = q.where(Task.property_id == property_id)
    if assigned_to:
        q = q.where(Task.assigned_to == assigned_to)
    result = await db.scalars(q.order_by(Task.due_date.asc().nulls_last()))
    return result.all()


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "tasks:write")
    task = Task(tenant_id=tenant.id, created_by=current_user.id, **data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    task = await db.scalar(select(Task).where(Task.id == task_id, Task.tenant_id == tenant.id))
    if not task:
        raise HTTPException(404, "Tache introuvable")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: UUID,
    data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "tasks:write")
    task = await db.scalar(select(Task).where(Task.id == task_id, Task.tenant_id == tenant.id))
    if not task:
        raise HTTPException(404)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/complete", response_model=TaskOut)
async def complete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "tasks:write")
    task = await db.scalar(select(Task).where(Task.id == task_id, Task.tenant_id == tenant.id))
    if not task:
        raise HTTPException(404)
    task.status = "done"
    task.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "tasks:delete")
    task = await db.scalar(select(Task).where(Task.id == task_id, Task.tenant_id == tenant.id))
    if not task:
        raise HTTPException(404)
    await db.delete(task)
    await db.commit()

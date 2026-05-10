from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import uuid
import os

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_tenant, check_permission
from app.models.property import Property, PropertyPhoto
from app.models.user import User
from app.models.tenant import Tenant

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = "uploads/properties"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


async def _save_file_local(file: UploadFile, folder: str) -> str:
    """Sauvegarde locale (dev) — remplacé par Azure Blob en prod."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(folder, filename)
    os.makedirs(folder, exist_ok=True)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    return f"/static/{folder}/{filename}"


async def _save_file_azure(file: UploadFile, container: str) -> str:
    """Sauvegarde Azure Blob Storage (prod)."""
    try:
        from azure.storage.blob import BlobServiceClient
        from app.core.config import settings

        conn_str = settings.AZURE_STORAGE_CONNECTION_STRING
        if not conn_str:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING non configuré")

        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        blob_name = f"{uuid.uuid4()}.{ext}"

        service = BlobServiceClient.from_connection_string(conn_str)
        blob_client = service.get_blob_client(container=container, blob=blob_name)

        content = await file.read()
        blob_client.upload_blob(content, content_type=file.content_type)

        account_name = service.account_name
        return f"https://{account_name}.blob.core.windows.net/{container}/{blob_name}"
    except ImportError:
        raise HTTPException(500, "azure-storage-blob non installé")


async def save_file(file: UploadFile) -> str:
    """Route automatique : Azure si configuré, sinon local."""
    from app.core.config import settings
    if settings.AZURE_STORAGE_CONNECTION_STRING:
        return await _save_file_azure(file, settings.AZURE_STORAGE_CONTAINER)
    return await _save_file_local(file, UPLOAD_DIR)


@router.post("/properties/{property_id}/photos")
async def upload_photo(
    property_id: UUID,
    file: UploadFile = File(...),
    is_cover: bool = False,
    caption: str = "",
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:write")

    # Vérifier le bien
    prop = await db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant.id))
    if not prop:
        raise HTTPException(404, "Bien introuvable")

    # Vérifier le type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Type non supporté : {file.content_type}. Utilisez JPEG, PNG ou WebP.")

    # Vérifier la taille
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "Fichier trop volumineux (max 10 MB)")
    await file.seek(0)

    # Uploader
    url = await save_file(file)

    # Compter les photos existantes pour la position
    from sqlalchemy import func
    count = await db.scalar(select(func.count()).where(PropertyPhoto.property_id == property_id))

    # Si cover demandé, enlever l'ancienne cover
    if is_cover:
        old_covers = await db.scalars(
            select(PropertyPhoto).where(PropertyPhoto.property_id == property_id, PropertyPhoto.is_cover == True)
        )
        for p in old_covers.all():
            p.is_cover = False

    photo = PropertyPhoto(
        property_id=property_id,
        url=url,
        caption=caption or None,
        position=count,
        is_cover=is_cover or count == 0,  # La première photo est cover par défaut
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return {
        "id": str(photo.id),
        "url": photo.url,
        "caption": photo.caption,
        "position": photo.position,
        "is_cover": photo.is_cover,
    }


@router.delete("/properties/{property_id}/photos/{photo_id}", status_code=204)
async def delete_photo(
    property_id: UUID,
    photo_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:write")
    photo = await db.scalar(
        select(PropertyPhoto).where(PropertyPhoto.id == photo_id, PropertyPhoto.property_id == property_id)
    )
    if not photo:
        raise HTTPException(404)
    await db.delete(photo)
    await db.commit()


@router.patch("/properties/{property_id}/photos/{photo_id}/cover", status_code=200)
async def set_cover(
    property_id: UUID,
    photo_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    check_permission(current_user, "properties:write")

    # Enlever toutes les covers
    old_covers = await db.scalars(
        select(PropertyPhoto).where(PropertyPhoto.property_id == property_id)
    )
    for p in old_covers.all():
        p.is_cover = (str(p.id) == str(photo_id))

    await db.commit()
    return {"message": "Photo de couverture mise à jour"}

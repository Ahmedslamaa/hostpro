from sqlalchemy import String, Boolean, JSON, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid
from datetime import datetime
import uuid

from app.core.database import Base


class Owner(Base):
    __tablename__ = "owners"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"))
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    properties: Mapped[list["Property"]] = relationship(back_populates="owner")


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("owners.id"))

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    property_type: Mapped[str] = mapped_column(String(50), default="apartment")
    status: Mapped[str] = mapped_column(String(50), default="active")

    address: Mapped[str | None] = mapped_column(String(500))
    city: Mapped[str | None] = mapped_column(String(100))
    postal_code: Mapped[str | None] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(10), default="FR")
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8))
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8))

    max_guests: Mapped[int] = mapped_column(Integer, default=2)
    bedrooms: Mapped[int] = mapped_column(Integer, default=1)
    bathrooms: Mapped[int] = mapped_column(Integer, default=1)
    surface_m2: Mapped[float | None] = mapped_column(Numeric(8, 2))

    min_stay_nights: Mapped[int] = mapped_column(Integer, default=1)
    max_stay_nights: Mapped[int | None] = mapped_column(Integer)
    check_in_time: Mapped[str] = mapped_column(String(10), default="16:00")
    check_out_time: Mapped[str] = mapped_column(String(10), default="11:00")

    base_price_night: Mapped[float | None] = mapped_column(Numeric(10, 2))
    cleaning_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    security_deposit: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    amenities: Mapped[list] = mapped_column(JSON, default=list)
    house_rules: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    owner: Mapped["Owner | None"] = relationship(back_populates="properties")
    photos: Mapped[list["PropertyPhoto"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    compliance: Mapped["ComplianceRecord | None"] = relationship(back_populates="property", uselist=False)


class PropertyPhoto(Base):
    __tablename__ = "property_photos"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("properties.id", ondelete="CASCADE"))
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    caption: Mapped[str | None] = mapped_column(String(255))
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[str | None] = mapped_column(String(50))

    property: Mapped["Property"] = relationship(back_populates="photos")


from app.models.compliance import ComplianceRecord  # noqa: E402

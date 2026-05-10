from sqlalchemy import String, Boolean, JSON, ForeignKey, Integer, Numeric, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid
from datetime import date, datetime
import uuid

from app.core.database import Base


class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    property_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("properties.id"), unique=True)

    registration_number: Mapped[str | None] = mapped_column(String(100))
    registration_city: Mapped[str | None] = mapped_column(String(100))
    registration_expiry: Mapped[date | None] = mapped_column(Date)

    nuitees_year: Mapped[int] = mapped_column(Integer, default=0)
    nuitees_limit: Mapped[int] = mapped_column(Integer, default=120)
    nuitees_alert_at: Mapped[int] = mapped_column(Integer, default=100)
    current_year: Mapped[int | None] = mapped_column(Integer)

    dpe_class: Mapped[str | None] = mapped_column(String(5))
    dpe_expiry: Mapped[date | None] = mapped_column(Date)
    dpe_value: Mapped[float | None] = mapped_column(Numeric(8, 2))

    fiscal_regime: Mapped[str | None] = mapped_column(String(50))
    siret: Mapped[str | None] = mapped_column(String(20))
    tva_number: Mapped[str | None] = mapped_column(String(30))

    is_compliant: Mapped[bool] = mapped_column(Boolean, default=True)
    alerts: Mapped[list] = mapped_column(JSON, default=list)
    last_checked_at: Mapped[datetime | None] = mapped_column()
    updated_at: Mapped[datetime | None] = mapped_column()

    property: Mapped["Property"] = relationship(back_populates="compliance")
    nuitees_history: Mapped[list["NuiteesHistory"]] = relationship(back_populates="compliance_record", cascade="all, delete-orphan")


class NuiteesHistory(Base):
    __tablename__ = "nuitees_history"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    property_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("properties.id"))
    compliance_record_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("compliance_records.id"))
    reservation_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    nuitees_count: Mapped[int] = mapped_column(Integer, nullable=False)
    check_in: Mapped[date | None] = mapped_column(Date)
    check_out: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime | None] = mapped_column()

    compliance_record: Mapped["ComplianceRecord | None"] = relationship(back_populates="nuitees_history")


from app.models.property import Property  # noqa: E402

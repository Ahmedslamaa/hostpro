from sqlalchemy import String, Boolean, JSON, ForeignKey, Integer, Numeric, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid
from datetime import date, datetime
import uuid

from app.core.database import Base


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    nationality: Mapped[str | None] = mapped_column(String(10))
    id_document: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="guest")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    property_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("properties.id"))
    guest_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("guests.id"))

    source: Mapped[str] = mapped_column(String(50), default="manual")
    source_ref_id: Mapped[str | None] = mapped_column(String(255))

    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="confirmed")

    total_amount: Mapped[float | None] = mapped_column(Numeric(10, 2))
    cleaning_fee: Mapped[float | None] = mapped_column(Numeric(10, 2))
    platform_fee: Mapped[float | None] = mapped_column(Numeric(10, 2))
    net_revenue: Mapped[float | None] = mapped_column(Numeric(10, 2))
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")

    adults: Mapped[int] = mapped_column(Integer, default=1)
    children: Mapped[int] = mapped_column(Integer, default=0)

    notes_internal: Mapped[str | None] = mapped_column(Text)
    notes_guest: Mapped[str | None] = mapped_column(Text)
    check_in_done: Mapped[bool] = mapped_column(Boolean, default=False)
    check_out_done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    @property
    def nights(self) -> int:
        return (self.check_out - self.check_in).days

    guest: Mapped["Guest | None"] = relationship(back_populates="reservations")
    property: Mapped["Property"] = relationship()
    tasks: Mapped[list["Task"]] = relationship(back_populates="reservation")


from app.models.property import Property  # noqa: E402
from app.models.task import Task  # noqa: E402

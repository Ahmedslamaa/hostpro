from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid
from datetime import datetime
import uuid

from app.core.database import Base


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    trigger: Mapped[str | None] = mapped_column(String(100))
    subject: Mapped[str | None] = mapped_column(String(500))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(String(50), default="email")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class MessageThread(Base):
    __tablename__ = "message_threads"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    property_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("properties.id"))
    reservation_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("reservations.id"))
    guest_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("guests.id"))
    channel: Mapped[str] = mapped_column(String(50), default="email")
    status: Mapped[str] = mapped_column(String(50), default="open")
    last_message_at: Mapped[datetime | None] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    messages: Mapped[list["Message"]] = relationship(back_populates="thread", cascade="all, delete-orphan")
    guest: Mapped["Guest | None"] = relationship()
    property: Mapped["Property | None"] = relationship()


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), index=True)
    thread_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("message_threads.id", ondelete="CASCADE"))
    direction: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_automated: Mapped[bool] = mapped_column(Boolean, default=False)
    template_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("message_templates.id"))
    sent_at: Mapped[datetime | None] = mapped_column()
    read_at: Mapped[datetime | None] = mapped_column()
    created_at: Mapped[datetime | None] = mapped_column()

    thread: Mapped["MessageThread"] = relationship(back_populates="messages")


from app.models.property import Property  # noqa: E402
from app.models.reservation import Guest  # noqa: E402

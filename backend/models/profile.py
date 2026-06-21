from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Tek kullanıcı = tek profil
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    # Temel bilgiler
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    university: Mapped[str | None] = mapped_column(String(255), nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Beceriler (JSON dizisi — basit ve esnek)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    # CV
    cv_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cv_text: Mapped[str | None] = mapped_column(String, nullable=True)
    cv_uploaded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Telegram (ileride dolacak)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

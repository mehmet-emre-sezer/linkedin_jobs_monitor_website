from datetime import datetime
from sqlalchemy import Boolean, Integer, String, ForeignKey, DateTime, func, JSON
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

    # Onboarding'i bitirip bitirmediği — yönlendirme bunun üzerinden yapılır
    # (email doğrulamasıyla karıştırılmamalı; ikisi farklı şey).
    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    # ── Arama tercihleri ──────────────────────────────────────────
    # Kullanıcı bunları kaydedince aktif SearchQuery'ler yeniden kurulur.
    search_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # "any" | "remote" | "hybrid" | "onsite"
    work_mode: Mapped[str] = mapped_column(
        String(16), nullable=False, default="any", server_default="any"
    )
    target_roles: Mapped[list[str]] = mapped_column(
        JSON, nullable=False, default=list, server_default="[]"
    )
    target_levels: Mapped[list[str]] = mapped_column(
        JSON, nullable=False, default=list, server_default="[]"
    )
    # Query üretim modu: "manual" (tercihlerden) | "ai" (LLM) | "hybrid" (ikisi)
    query_mode: Mapped[str] = mapped_column(
        String(16), nullable=False, default="ai", server_default="ai"
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

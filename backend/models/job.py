from datetime import datetime
from sqlalchemy import (
    Integer, String, ForeignKey, DateTime, func, JSON, UniqueConstraint, Index,
)
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class Job(Base):
    """Scraper'ın bulduğu ve kullanıcıya gönderilen iş ilanı."""

    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("user_id", "linkedin_id", name="uq_jobs_user_linkedin"),
        Index("ix_jobs_user_created", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True,
    )

    # LinkedIn tarafındaki ilan ID'si (aynı kullanıcıya tekrar gönderilmesin)
    linkedin_id: Mapped[str] = mapped_column(String(64), nullable=False)

    title:    Mapped[str] = mapped_column(String(512), nullable=False)
    company:  Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    posted_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    applicants: Mapped[int | None] = mapped_column(Integer, nullable=True)

    score:   Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    matched_keywords: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    url:     Mapped[str] = mapped_column(String(1024), nullable=False)

    # Telegram'a iletilme zamanı (gönderilmediyse None)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

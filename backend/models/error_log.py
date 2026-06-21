from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class ErrorLog(Base):
    """Scraper, scorer, telegram, DB veya auth katmanında oluşan beklenmedik hatalar.

    Domain exception'lar (kullanıcı dostu hatalar) burada YAZILMAZ.
    Sadece kullanıcının yapacak bir şeyi olmayan, sistemsel/dış servis hataları.
    """

    __tablename__ = "error_logs"
    __table_args__ = (
        Index("ix_error_logs_timestamp", "timestamp"),
        Index("ix_error_logs_severity_source", "severity", "source"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # "error" | "warning" | "info"
    severity: Mapped[str] = mapped_column(String(16), nullable=False)

    # "scraper" | "scorer" | "telegram" | "database" | "auth"
    source: Mapped[str] = mapped_column(String(32), nullable=False)

    # NULL = sistemsel hata (belirli bir kullanıcıya ait değil)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True,
    )

    message: Mapped[str] = mapped_column(String(1024), nullable=False)
    stack_trace: Mapped[str | None] = mapped_column(String, nullable=True)

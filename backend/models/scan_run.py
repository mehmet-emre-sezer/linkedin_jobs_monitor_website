from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class ScanRun(Base):
    """Bir kullanıcı için yapılan tek bir tarama (günde ~3 kez)."""

    __tablename__ = "scan_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True,
    )

    started_at:  Mapped[datetime]        = mapped_column(DateTime, server_default=func.now(), index=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # "running" | "completed" | "failed"
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")

    # Tarama özeti — finished_at'le aynı anda dolar
    jobs_scanned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    jobs_new:     Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    jobs_sent:    Mapped[int] = mapped_column(Integer, nullable=False, default=0)

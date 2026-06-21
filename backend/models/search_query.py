from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, DateTime, Boolean, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class SearchQuery(Base):
    """Bir kullanıcının LinkedIn arama sorgusu.

    Onboarding/CV parse sonrası query_generator otomatik 5 tane üretir.
    Optimizer (10 run'da bir) yeniden yazar — eskiler is_active=False olur.
    """

    __tablename__ = "search_queries"
    __table_args__ = (
        Index("ix_search_queries_user_active", "user_id", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True,
    )

    # LinkedIn boolean syntax destekli arama metni
    query_text: Mapped[str] = mapped_column(String(2048), nullable=False)

    # False olunca scan_user task'ı bu sorguyu atlar (optimizer eskiyi pasifleştirir)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
    )

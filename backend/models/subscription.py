from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


# Abonelik durumları. Tarama yalnızca "trialing" veya "active" iken çalışır.
STATUS_TRIALING = "trialing"   # kart alındı, 7 gün ücretsiz sürüyor
STATUS_ACTIVE = "active"       # ödeme alındı, dönem devam ediyor
STATUS_PAST_DUE = "past_due"   # tekrar tahsilat başarısız — erişim kapalı
STATUS_CANCELED = "canceled"   # kullanıcı iptal etti / dönem bitti

# Erişim veren (tarama yapılan) durumlar
ACTIVE_STATUSES = (STATUS_TRIALING, STATUS_ACTIVE)


class Subscription(Base):
    """Kullanıcının abonelik durumu. Kullanıcı başına tek satır.

    Durum iyzico webhook'larıyla güncellenir; tarama filtresi (enqueue_all_user_scans)
    bu tabloya bakar. Sağlayıcıdan bağımsız tutuldu (provider alanı) ki ileride
    başka sağlayıcı eklenebilsin.
    """

    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # trialing | active | past_due | canceled
    status: Mapped[str] = mapped_column(String(16), nullable=False, index=True)

    # Deneme bitiş ve dönem bitiş zamanları (bilgi/gösterim için; erişim kararı
    # status üzerinden verilir, webhook'lar status'ü güncel tutar).
    trial_ends_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    current_period_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Ödeme sağlayıcısı ve oradaki abonelik referansı (iptal/sorgu için)
    provider: Mapped[str] = mapped_column(String(32), nullable=False, default="iyzico")
    provider_ref: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

from datetime import datetime
from pydantic import BaseModel


class AdminOverview(BaseModel):
    """Genel bakış kartları — sistem geneli sayılar."""
    total_users: int
    active_users: int        # son 7 günde görülmüş
    registered_today: int
    errors_last_24h: int


class FunnelStep(BaseModel):
    """Kullanıcı yolculuğu hunisinin tek adımı."""
    label: str
    user_count: int


class AdminUserItem(BaseModel):
    """Kullanıcı listesinde tek satır."""
    id: int
    name: str | None
    email: str
    registered_at: datetime
    last_seen_at: datetime
    subscription: str          # ödeme kademesi yok — şimdilik herkes "free"
    is_telegram_connected: bool


class AdminUserDetail(BaseModel):
    """Tek kullanıcının profil + tarama istatistikleri."""
    id: int
    email: str
    name: str | None
    university: str | None
    graduation_year: int | None
    skills: list[str]
    telegram_chat_id: str | None
    total_jobs_scanned: int
    total_jobs_sent: int
    average_score: int

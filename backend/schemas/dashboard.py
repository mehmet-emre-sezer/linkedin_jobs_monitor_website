from datetime import datetime
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Üst panelin ihtiyaç duyduğu özet metrikler."""
    scanned_this_week: int
    sent_this_week: int
    average_score: int
    max_score: int
    next_scan_at: str            # "HH:mm" formatı
    is_telegram_connected: bool


class JobItem(BaseModel):
    """Dashboard'daki ilan kartında gösterilen alanlar."""
    id: int
    title: str
    company: str
    location: str
    score: int
    posted_at: str | None
    applicants: int | None
    summary: str | None
    matched_keywords: list[str]
    url: str
    created_at: datetime

    class Config:
        from_attributes = True


class QueryStat(BaseModel):
    """Sorgu performans satırı (sağ kolon)."""
    query: str
    job_count: int
    average_score: int

from pydantic import BaseModel, Field


class JobNotification(BaseModel):
    """Bir iş ilanı bildirimi için gerekli alanlar."""
    title: str
    company: str
    location: str
    posted_at: str            # "2026-06-04"
    applicants: int | None    # bilinmiyorsa None
    score: int = Field(ge=0, le=100)
    summary: str              # AI tarafından üretilen kısa açıklama
    matched_keywords: list[str]
    url: str


class ScanSummary(BaseModel):
    """Tarama tamamlandı özeti."""
    scanned: int
    new: int
    sent: int

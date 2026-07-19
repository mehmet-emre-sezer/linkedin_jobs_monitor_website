"""Dashboard verilerini DB sorgularıyla hesaplar.

Yeni kullanıcıda tablolar boş — sorgular 0 / [] döner, frontend empty state gösterir.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from core.config import settings
from models.job import Job
from models.profile import Profile
from models.scan_run import ScanRun
from schemas.dashboard import DashboardSummary, JobItem, QueryStat


# Tarama saati tek yerde: core.config. Burada ayrıca sabit tutulunca beat
# schedule ile kayıyordu (dashboard 18:00 gösterirken tarama 19:00'daydı).
DEFAULT_NEXT_SCAN_AT = f"{settings.scan_hour:02d}:{settings.scan_minute:02d}"


def _week_ago() -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=7)


def get_summary(db: Session, user_id: int) -> DashboardSummary:
    """Üst banner + 4 metrik kart için özet."""
    week_ago = _week_ago()

    # Bu haftaki taramalardan toplamlar
    weekly = (
        db.query(
            func.coalesce(func.sum(ScanRun.jobs_scanned), 0),
            func.coalesce(func.sum(ScanRun.jobs_sent), 0),
        )
        .filter(ScanRun.user_id == user_id, ScanRun.started_at >= week_ago)
        .one()
    )
    scanned_this_week, sent_this_week = weekly

    # Tüm zamanlar için skor istatistikleri
    score_stats = (
        db.query(
            func.coalesce(func.avg(Job.score), 0),
            func.coalesce(func.max(Job.score), 0),
        )
        .filter(Job.user_id == user_id)
        .one()
    )
    average_score, max_score = score_stats

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    is_telegram_connected = bool(profile and profile.telegram_chat_id)

    return DashboardSummary(
        scanned_this_week=int(scanned_this_week),
        sent_this_week=int(sent_this_week),
        average_score=round(float(average_score)),
        max_score=int(max_score),
        next_scan_at=DEFAULT_NEXT_SCAN_AT,
        is_telegram_connected=is_telegram_connected,
    )


def get_recent_jobs(db: Session, user_id: int, limit: int = 10) -> list[JobItem]:
    """Kullanıcıya gönderilmiş son N ilan (en yeniden eskiye)."""
    rows = (
        db.query(Job)
        .filter(Job.user_id == user_id)
        .order_by(Job.created_at.desc())
        .limit(limit)
        .all()
    )
    return [JobItem.model_validate(row) for row in rows]


def get_query_stats(_db: Session, _user_id: int) -> list[QueryStat]:
    """Sorgu performansı. Faz 6'da scraper bunu üretecek; şu an boş."""
    return []

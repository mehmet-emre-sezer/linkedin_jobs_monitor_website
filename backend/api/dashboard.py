from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.auth import get_current_user
from core.database import get_db
from models.user import User
from schemas.dashboard import DashboardSummary, JobItem, QueryStat
from services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

MAX_RECENT_JOBS = 50


@router.get("/summary", response_model=DashboardSummary)
def summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardSummary:
    """Üst banner + 4 metrik için özet."""
    return dashboard_service.get_summary(db, current_user.id)


@router.get("/jobs", response_model=list[JobItem])
def recent_jobs(
    limit: int = Query(10, ge=1, le=MAX_RECENT_JOBS),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JobItem]:
    """En son gönderilen ilanlar."""
    return dashboard_service.get_recent_jobs(db, current_user.id, limit=limit)


@router.get("/query-stats", response_model=list[QueryStat])
def query_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[QueryStat]:
    """Sorgu performansı satırları (şimdilik boş — Faz 6'da dolacak)."""
    return dashboard_service.get_query_stats(db, current_user.id)

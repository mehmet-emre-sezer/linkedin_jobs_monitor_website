from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.auth import require_admin
from core.database import get_db
from core.exceptions import UserNotFoundError
from models.user import User
from schemas.admin import AdminOverview, AdminUserDetail, AdminUserItem, FunnelStep
from schemas.error_log import ErrorLogResponse
from services import admin_service, error_log_service

router = APIRouter(prefix="/admin", tags=["admin"])

MAX_ERROR_LIMIT = 500
MAX_USER_LIMIT = 500


@router.get("/overview", response_model=AdminOverview)
def get_overview(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminOverview:
    """Genel bakış kartları — toplam/aktif kullanıcı, bugünkü kayıt, son 24s hata."""
    return admin_service.get_overview(db)


@router.get("/funnel", response_model=list[FunnelStep])
def get_funnel(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[FunnelStep]:
    """Kullanıcı yolculuğu hunisi (kayıt → e-posta → onboarding → CV → telegram)."""
    return admin_service.get_funnel(db)


@router.get("/users", response_model=list[AdminUserItem])
def list_users(
    limit: int = Query(100, ge=1, le=MAX_USER_LIMIT),
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[AdminUserItem]:
    """En yeniden eskiye kullanıcı listesi (profil bilgisiyle)."""
    return admin_service.list_users(db, limit=limit)


@router.get("/users/{user_id}", response_model=AdminUserDetail)
def get_user_detail(
    user_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserDetail:
    """Tek kullanıcının profil + tarama istatistikleri."""
    try:
        return admin_service.get_user_detail(db, user_id)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )


@router.get("/errors", response_model=list[ErrorLogResponse])
def list_errors(
    severity: str | None = Query(None, pattern="^(error|warning|info)$"),
    source: str | None = Query(
        None,
        pattern="^(scraper|scorer|telegram|database|auth|unknown)$",
    ),
    limit: int = Query(100, ge=1, le=MAX_ERROR_LIMIT),
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[ErrorLogResponse]:
    """En yeniden eskiye, opsiyonel severity/source filtresi ile hata logları."""
    return error_log_service.list_errors(
        db,
        severity=severity,  # type: ignore[arg-type]
        source=source,       # type: ignore[arg-type]
        limit=limit,
    )

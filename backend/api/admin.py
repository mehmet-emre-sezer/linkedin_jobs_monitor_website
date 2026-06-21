from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.auth import require_admin
from core.database import get_db
from models.user import User
from schemas.error_log import ErrorLogResponse
from services import error_log_service

router = APIRouter(prefix="/admin", tags=["admin"])

MAX_ERROR_LIMIT = 500


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

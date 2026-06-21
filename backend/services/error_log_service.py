"""ErrorLog kaydı için merkezi servis.

Scraper, scorer, telegram, DB veya auth katmanında oluşan **beklenmedik** hatalar
buraya yazılır. Domain exception'lar (kullanıcı dostu) burada YAZILMAZ.

Filtreleme (severity, source, user_id) admin endpoint'i için.
"""

import logging
import traceback
from typing import Literal

from sqlalchemy.orm import Session

from models.error_log import ErrorLog

logger = logging.getLogger(__name__)


Severity = Literal["error", "warning", "info"]
Source = Literal["scraper", "scorer", "telegram", "database", "auth", "unknown"]


def log_error(
    db: Session,
    *,
    severity: Severity,
    source: Source,
    message: str,
    exc: Exception | None = None,
    user_id: int | None = None,
) -> ErrorLog:
    """Yeni ErrorLog satırı oluştur. exc verilirse stack trace otomatik çıkarılır."""
    stack_trace = "".join(
        traceback.format_exception(type(exc), exc, exc.__traceback__)
    ) if exc else None

    entry = ErrorLog(
        severity=severity,
        source=source,
        user_id=user_id,
        message=message[:1024],   # kolon limiti
        stack_trace=stack_trace,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # İkinci hat: standart log'a da düşür (Railway/CloudWatch görsün)
    logger.log(
        logging.ERROR if severity == "error" else logging.WARNING,
        "[%s] %s user_id=%s — %s", source, severity, user_id, message,
    )
    return entry


def list_errors(
    db: Session,
    *,
    severity: Severity | None = None,
    source: Source | None = None,
    limit: int = 100,
) -> list[ErrorLog]:
    """Filtreli + en yeniden eskiye sıralı liste."""
    query = db.query(ErrorLog)
    if severity is not None:
        query = query.filter(ErrorLog.severity == severity)
    if source is not None:
        query = query.filter(ErrorLog.source == source)
    return query.order_by(ErrorLog.timestamp.desc()).limit(limit).all()

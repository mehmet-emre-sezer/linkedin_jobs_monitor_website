"""Tek bir kullanıcı için tarama task'ı.

Eski main.py'nin akışı, DB-driven hale getirilmiş:
1. ScanRun oluştur (status=running)
2. Profile.cv_text + aktif SearchQuery'leri yükle
3. scraper.provider ile ilanları topla (mock veya selenium)
4. DB'de zaten olan (linkedin_id) ilanları atla
5. Her yeni ilanı LLM ile puanla → DB'ye Job olarak yaz
6. Threshold üstü olanları Telegram'a gönder + sent_at damga
7. ScanRun finished_at + sayılar
8. Tarama özetini Telegram'a gönder

Hata politikası:
- LLM hatası → ilanı atla (bir sonraki taramada tekrar denenir, Job kaydı yok)
- Scraping toplu hatası → ScanRun status=failed, error_log
- DB hatası → Celery autoretry devreye girer (max 2 retry)
"""

import logging
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.config import settings
from core.database import SessionLocal
from models.job import Job
from models.profile import Profile
from models.scan_run import ScanRun
from models.search_query import SearchQuery
from schemas.notification import JobNotification, ScanSummary
from scraper.provider import scrape_jobs
from scraper.scoring import score_job
from services import error_log_service, notification_service
from tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="scan_user",
    bind=True,
    autoretry_for=(IntegrityError,),
    retry_kwargs={"max_retries": 2, "countdown": 60},
)
def scan_user(self, user_id: int) -> dict:
    """Tek kullanıcı için tarama. Sonuç dict — Beat / manuel tetikleyici için bilgi."""
    logger.info("scan_user başladı user_id=%s task_id=%s", user_id, self.request.id)
    db = SessionLocal()
    run = _create_run(db, user_id)

    try:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile is None:
            _finish_run(db, run, status="failed")
            error_log_service.log_error(
                db,
                severity="warning",
                source="scraper",
                message="Tarama atlandı: profil yok",
                user_id=user_id,
            )
            return {"user_id": user_id, "status": "skipped", "reason": "no_profile"}

        queries = _load_active_queries(db, user_id)
        if not queries:
            _finish_run(db, run, status="failed")
            error_log_service.log_error(
                db,
                severity="warning",
                source="scraper",
                message="Tarama atlandı: aktif arama sorgusu yok",
                user_id=user_id,
            )
            return {"user_id": user_id, "status": "skipped", "reason": "no_queries"}

        all_jobs = scrape_jobs(queries)
        unique_jobs = _dedupe_by_id(all_jobs)
        new_jobs = _filter_already_seen(db, user_id, unique_jobs)

        sent = _process_jobs(db, profile, new_jobs, run)

        _finish_run(
            db, run, status="completed",
            jobs_scanned=len(unique_jobs),
            jobs_new=len(new_jobs),
            jobs_sent=sent,
        )

        # Telegram özet
        notification_service.send_scan_summary(
            profile,
            ScanSummary(scanned=len(unique_jobs), new=len(new_jobs), sent=sent),
        )

        logger.info(
            "scan_user bitti user_id=%s scanned=%d new=%d sent=%d",
            user_id, len(unique_jobs), len(new_jobs), sent,
        )
        return {
            "user_id": user_id, "status": "completed",
            "scanned": len(unique_jobs), "new": len(new_jobs), "sent": sent,
        }

    except Exception as exc:
        _finish_run(db, run, status="failed")
        error_log_service.log_error(
            db, severity="error", source="scraper",
            message=f"Tarama sırasında beklenmedik hata: {exc}",
            exc=exc, user_id=user_id,
        )
        raise   # Celery autoretry devreye girsin
    finally:
        db.close()


# ── Yardımcılar ──────────────────────────────────────────────────

def _create_run(db: Session, user_id: int) -> ScanRun:
    run = ScanRun(user_id=user_id, status="running")
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def _finish_run(
    db: Session,
    run: ScanRun,
    *,
    status: str,
    jobs_scanned: int = 0,
    jobs_new: int = 0,
    jobs_sent: int = 0,
) -> None:
    run.status = status
    run.finished_at = datetime.now(timezone.utc)
    run.jobs_scanned = jobs_scanned
    run.jobs_new = jobs_new
    run.jobs_sent = jobs_sent
    db.commit()


def _load_active_queries(db: Session, user_id: int) -> list[str]:
    rows = (
        db.query(SearchQuery)
        .filter(SearchQuery.user_id == user_id, SearchQuery.is_active.is_(True))
        .all()
    )
    return [row.query_text for row in rows]


def _build_candidate_profile(profile: Profile) -> str:
    """Scoring/match reasoning için aday profili: manuel beceriler + CV metni.

    CV opsiyonel — yoksa sadece becerilerle değerlendirilir.
    """
    parts: list[str] = []
    if profile.skills:
        parts.append("Beceriler: " + ", ".join(profile.skills))
    if profile.cv_text and profile.cv_text.strip():
        parts.append("CV:\n" + profile.cv_text.strip())
    return "\n\n".join(parts)


def _dedupe_by_id(jobs: list[dict]) -> list[dict]:
    """Aynı linkedin_id birden fazla query'ye düşmüş olabilir; ilki tut."""
    seen_ids: set[str] = set()
    unique: list[dict] = []
    for job in jobs:
        jid = job.get("id")
        if not jid or jid in seen_ids:
            continue
        seen_ids.add(jid)
        unique.append(job)
    return unique


def _filter_already_seen(db: Session, user_id: int, jobs: list[dict]) -> list[dict]:
    """DB'de zaten Job kaydı olan ilanları (bu kullanıcı için) çıkar."""
    if not jobs:
        return []
    ids = [j["id"] for j in jobs]
    existing = {
        row.linkedin_id
        for row in db.query(Job.linkedin_id)
        .filter(Job.user_id == user_id, Job.linkedin_id.in_(ids))
        .all()
    }
    return [j for j in jobs if j["id"] not in existing]


def _process_jobs(
    db: Session,
    profile: Profile,
    new_jobs: list[dict],
    _run: ScanRun,
) -> int:
    """LLM ile puanla, Job kaydını yaz, threshold üstüne bildirim gönder."""
    sent_count = 0
    candidate_profile = _build_candidate_profile(profile)

    for job in new_jobs:
        scoring = score_job(job, candidate_profile=candidate_profile)
        if scoring is None:
            # LLM hatası — bir sonraki taramada tekrar denensin
            logger.warning("Scoring başarısız, atlanıyor: %s", job.get("title", "?"))
            continue

        score = scoring["score"]
        is_match = score >= settings.score_threshold

        db_job = Job(
            user_id=profile.user_id,
            linkedin_id=job["id"],
            title=job["title"],
            company=job["company"],
            location=job["location"],
            posted_at=job.get("posted_at") or None,
            applicants=_parse_applicants(job.get("applicants")),
            score=score,
            summary=scoring.get("reason"),
            matched_keywords=scoring.get("matches", []),
            url=job.get("link") or "",
        )

        if is_match:
            notif = JobNotification(
                title=job["title"], company=job["company"], location=job["location"],
                posted_at=job.get("posted_at") or "",
                applicants=_parse_applicants(job.get("applicants")),
                score=score,
                summary=scoring.get("reason", ""),
                matched_keywords=scoring.get("matches", []),
                url=job.get("link") or "",
            )
            delivered = notification_service.send_job_notification(profile, notif)
            if delivered:
                db_job.sent_at = datetime.now(timezone.utc)
                sent_count += 1

        try:
            db.add(db_job)
            db.commit()
        except IntegrityError:
            # Aynı (user_id, linkedin_id) başka bir paralel scan'de yazılmış olabilir
            db.rollback()
            logger.debug("Duplicate Job atlandı: %s", job["id"])

    return sent_count


def _parse_applicants(raw) -> int | None:
    """'124 applicants' veya '124+ applicants' → 124. Boş veya parse edilemezse None."""
    if not raw:
        return None
    if isinstance(raw, int):
        return raw
    digits = "".join(ch for ch in str(raw) if ch.isdigit())
    return int(digits) if digits else None

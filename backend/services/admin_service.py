"""Admin paneli verilerini DB sorgularıyla hesaplar.

Tüm sorgular salt-okunur. Yetki kontrolü endpoint katmanında (require_admin) yapılır;
bu servis HTTP bilmez — kullanıcı yoksa domain exception (UserNotFoundError) fırlatır.
Yeni/boş sistemde sayımlar 0 döner, frontend boş durumu gösterir.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from core.exceptions import UserNotFoundError
from models.error_log import ErrorLog
from models.job import Job
from models.profile import Profile
from models.scan_run import ScanRun
from models.user import User
from schemas.admin import AdminOverview, AdminUserDetail, AdminUserItem, FunnelStep


# Ödeme kademesi henüz yok — tüm kullanıcılar ücretsiz kademede.
DEFAULT_SUBSCRIPTION = "free"

# "Aktif kullanıcı" = son bu kadar günde görülmüş.
ACTIVE_WINDOW_DAYS = 7


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _start_of_today() -> datetime:
    return _now().replace(hour=0, minute=0, second=0, microsecond=0)


def get_overview(db: Session) -> AdminOverview:
    """Genel bakış için 4 sistem metriği."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = (
        db.query(func.count(User.id))
        .filter(User.last_seen_at >= _now() - timedelta(days=ACTIVE_WINDOW_DAYS))
        .scalar()
    ) or 0
    registered_today = (
        db.query(func.count(User.id))
        .filter(User.created_at >= _start_of_today())
        .scalar()
    ) or 0
    errors_last_24h = (
        db.query(func.count(ErrorLog.id))
        .filter(ErrorLog.timestamp >= _now() - timedelta(hours=24))
        .scalar()
    ) or 0

    return AdminOverview(
        total_users=total_users,
        active_users=active_users,
        registered_today=registered_today,
        errors_last_24h=errors_last_24h,
    )


def get_funnel(db: Session) -> list[FunnelStep]:
    """Kayıt → e-posta → onboarding → CV → telegram hunisi (her adımdaki kişi sayısı)."""
    registered = db.query(func.count(User.id)).scalar() or 0
    verified = (
        db.query(func.count(User.id))
        .filter(User.is_email_verified.is_(True))
        .scalar()
    ) or 0
    onboarding_started = (
        db.query(func.count(Profile.id)).filter(Profile.name.isnot(None)).scalar()
    ) or 0
    cv_uploaded = (
        db.query(func.count(Profile.id)).filter(Profile.cv_filename.isnot(None)).scalar()
    ) or 0
    telegram_linked = (
        db.query(func.count(Profile.id))
        .filter(Profile.telegram_chat_id.isnot(None))
        .scalar()
    ) or 0

    return [
        FunnelStep(label="Kayıt oldu", user_count=registered),
        FunnelStep(label="E-posta doğruladı", user_count=verified),
        FunnelStep(label="Onboarding başladı", user_count=onboarding_started),
        FunnelStep(label="CV yükledi", user_count=cv_uploaded),
        FunnelStep(label="Telegram bağladı", user_count=telegram_linked),
    ]


def list_users(db: Session, limit: int = 100) -> list[AdminUserItem]:
    """En yeni kayıttan eskiye kullanıcılar + profil bilgisi (LEFT JOIN — profil olmayabilir)."""
    rows = (
        db.query(User, Profile)
        .outerjoin(Profile, Profile.user_id == User.id)
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        AdminUserItem(
            id=user.id,
            name=profile.name if profile else None,
            email=user.email,
            registered_at=user.created_at,
            last_seen_at=user.last_seen_at,
            subscription=DEFAULT_SUBSCRIPTION,
            is_telegram_connected=bool(profile and profile.telegram_chat_id),
        )
        for user, profile in rows
    ]


def get_user_detail(db: Session, user_id: int) -> AdminUserDetail:
    """Tek kullanıcının profil + tarama istatistikleri. Yoksa UserNotFoundError."""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UserNotFoundError()

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    total_scanned, total_sent = (
        db.query(
            func.coalesce(func.sum(ScanRun.jobs_scanned), 0),
            func.coalesce(func.sum(ScanRun.jobs_sent), 0),
        )
        .filter(ScanRun.user_id == user_id)
        .one()
    )
    average_score = (
        db.query(func.coalesce(func.avg(Job.score), 0))
        .filter(Job.user_id == user_id)
        .scalar()
    )

    return AdminUserDetail(
        id=user.id,
        email=user.email,
        name=profile.name if profile else None,
        registered_at=user.created_at,
        last_seen_at=user.last_seen_at,
        subscription=DEFAULT_SUBSCRIPTION,
        university=profile.university if profile else None,
        graduation_year=profile.graduation_year if profile else None,
        skills=profile.skills if profile else [],
        telegram_chat_id=profile.telegram_chat_id if profile else None,
        total_jobs_scanned=int(total_scanned),
        total_jobs_sent=int(total_sent),
        average_score=round(float(average_score)),
    )

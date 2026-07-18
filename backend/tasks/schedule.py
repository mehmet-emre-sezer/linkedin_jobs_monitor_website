"""Beat'in periyodik olarak çağırdığı dispatcher task.

Tek kullanıcılı (eski) sistemden farklı: tarama yapılabilecek kullanıcı havuzu
DB'den çekilir, her biri için `scan_user` task'ı kuyruğa atılır. Worker
concurrency=1 olduğu için kullanıcılar sırayla işlenir → LinkedIn ban riski düşer.
"""

import logging

from core.database import SessionLocal
from models.user import User
from tasks.celery_app import celery_app
from tasks.scan_user import scan_user

logger = logging.getLogger(__name__)


@celery_app.task(name="enqueue_all_user_scans", bind=True)
def enqueue_all_user_scans(self) -> dict:
    """Tarama yapılabilecek tüm kullanıcılar için scan_user task'ı kuyruğa at."""
    logger.info("enqueue_all_user_scans başladı task_id=%s", self.request.id)
    db = SessionLocal()
    try:
        # Admin hesapları operasyon hesabı — zamanlanmış taramaya girmez.
        # (/admin "Test et" düğmesi scan_user'ı doğrudan çağırdığı için elle
        # tetikleme yine çalışır.)
        user_ids = [
            row[0]
            for row in db.query(User.id)
            .filter(User.is_email_verified.is_(True), User.is_admin.is_(False))
            .order_by(User.id)
            .all()
        ]
    finally:
        db.close()

    for uid in user_ids:
        scan_user.delay(uid)

    logger.info("%d kullanıcı için scan_user kuyruğa atıldı", len(user_ids))
    return {"enqueued": len(user_ids), "user_ids": user_ids}

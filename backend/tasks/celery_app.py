"""Celery application — worker + Beat tarafından paylaşılır.

Worker çalıştırma:
    celery -A tasks.celery_app worker --loglevel=info --concurrency=1

Beat (scheduler) çalıştırma:
    celery -A tasks.celery_app beat --loglevel=info

Hem worker hem Beat aynı app instance'ını import eder.
"""

from celery import Celery
from celery.schedules import crontab

from core.config import settings


celery_app = Celery(
    "jobradar",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "tasks.scan_user",
        "tasks.schedule",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Istanbul",
    enable_utc=True,
    # Bir task'ın maksimum süresi. Residential proxy yavaş (~20 sn/ilan), o yüzden
    # geniş tutuldu; asılı sayfaları driver'daki page load timeout zaten kesiyor.
    task_soft_time_limit=45 * 60,   # 45 dakika soft
    task_time_limit=50 * 60,        # 50 dakika hard kill
    # Worker başına aynı anda 1 task — Faz 6 kararı (LinkedIn ban riski)
    worker_concurrency=1,
    worker_prefetch_multiplier=1,   # tek seferde 1 task çek, sırada bekletme
    # Beat schedule — Türkiye saatiyle günde 1 kez, akşam 20:30.
    # LinkedIn sorgusu son 24 saati tarıyor (f_TPR=r86400), bu yüzden günde tek
    # tarama pencereyle birebir örtüşüyor: ilan kaçmıyor, aynı pencere tekrar
    # taranmadığı için proxy trafiği ve AI token'ı boşa gitmiyor.
    beat_schedule={
        "scan-evening": {
            "task": "enqueue_all_user_scans",
            "schedule": crontab(hour=settings.scan_hour, minute=settings.scan_minute),
        },
    },
)

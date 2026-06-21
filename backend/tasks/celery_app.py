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
    # Bir task'ın maksimum süresi (LinkedIn ban paranoyası: çok uzun sürmesin)
    task_soft_time_limit=20 * 60,   # 20 dakika soft
    task_time_limit=25 * 60,        # 25 dakika hard kill
    # Worker başına aynı anda 1 task — Faz 6 kararı (LinkedIn ban riski)
    worker_concurrency=1,
    worker_prefetch_multiplier=1,   # tek seferde 1 task çek, sırada bekletme
    # Beat schedule — Türkiye saatiyle günde 3 kez
    beat_schedule={
        "scan-morning": {
            "task": "enqueue_all_user_scans",
            "schedule": crontab(hour=9,  minute=0),
        },
        "scan-noon": {
            "task": "enqueue_all_user_scans",
            "schedule": crontab(hour=14, minute=0),
        },
        "scan-evening": {
            "task": "enqueue_all_user_scans",
            "schedule": crontab(hour=19, minute=0),
        },
    },
)

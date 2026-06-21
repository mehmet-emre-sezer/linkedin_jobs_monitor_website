"""Tüm modeller burada eager import edilir.

Sebep: SQLAlchemy FK ilişkilerini çözmek için tüm Model sınıflarının
metadata'ya kayıtlı olması lazım. Bir caller (Celery worker, alembic, vs.)
sadece bir modeli import etse bile FK'ları bulabilsin diye.
"""

from models.user import User
from models.profile import Profile
from models.job import Job
from models.scan_run import ScanRun
from models.search_query import SearchQuery
from models.error_log import ErrorLog

__all__ = [
    "User",
    "Profile",
    "Job",
    "ScanRun",
    "SearchQuery",
    "ErrorLog",
]

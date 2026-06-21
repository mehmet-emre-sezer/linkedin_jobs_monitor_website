"""CV dosya yükleme + parse servisi.

Gerçek mod: scraper.cv_parser (pdfplumber + Groq LLM).
GROQ_API_KEY tanımlı değilse fallback mock — lokal'de Groq olmadan da
onboarding test edilebilir.
"""

import logging
import re
import secrets
import time
from dataclasses import dataclass, field
from pathlib import Path

from fastapi import UploadFile

from core.config import settings
from core.exceptions import FileTooLargeError, InvalidFileTypeError

logger = logging.getLogger(__name__)


ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
CV_STORAGE_DIR = Path("uploads/cv")


@dataclass(frozen=True)
class CvParseResult:
    text: str                          # tam profil özeti (DB'de Profile.cv_text'e gider)
    name: str | None
    university: str | None
    graduation_year: int | None
    skills: list[str]
    queries: list[str] = field(default_factory=list)  # LLM tarafından üretilen sorgular


def _sanitize_filename(name: str) -> str:
    """Dosya adından tehlikeli karakterleri at, sadece harf/rakam/nokta/tire bırak."""
    base = Path(name).name
    return re.sub(r"[^A-Za-z0-9._-]", "_", base)[:120]


def _validate(file: UploadFile, size_bytes: int) -> None:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise InvalidFileTypeError(extension or "unknown")
    if size_bytes > MAX_FILE_BYTES:
        raise FileTooLargeError(size_bytes)
    if size_bytes == 0:
        raise InvalidFileTypeError("empty")


async def save_cv_file(user_id: int, file: UploadFile) -> tuple[Path, str]:
    """Yüklenen CV dosyasını diske kaydet. (yol, orijinal isim) döndürür."""
    content = await file.read()
    _validate(file, len(content))

    CV_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = _sanitize_filename(file.filename or "cv")
    unique = f"{user_id}_{int(time.time())}_{secrets.token_hex(4)}_{safe_name}"
    path = CV_STORAGE_DIR / unique
    path.write_bytes(content)
    return path, safe_name


# ── Mock fallback (GROQ_API_KEY yokken) ─────────────────────────

_MOCK_RESULT = CvParseResult(
    text="(mock CV içeriği — GROQ_API_KEY tanımlı olduğunda gerçek parse devreye girer)",
    name="Mehmet Emre Sezer",
    university="İstanbul Teknik Üniversitesi",
    graduation_year=2025,
    skills=["Python", "Machine Learning", "SQL", "PyTorch", "scikit-learn"],
    queries=[],
)


# ── Public API ──────────────────────────────────────────────────

def parse_cv(path: Path) -> CvParseResult:
    """CV içeriğinden profil bilgisi çıkar.

    GROQ_API_KEY tanımlıysa gerçek parse (pdfplumber + LLM).
    Yoksa fallback mock dön — lokal geliştirme akışı kesilmesin.
    """
    if not settings.groq_api_key:
        logger.info("GROQ_API_KEY tanımlı değil; mock CvParseResult döndürülüyor.")
        return _MOCK_RESULT

    # Gerçek parse — scraper.cv_parser
    from scraper.cv_parser import extract_text_from_pdf, parse_cv_text

    cv_text = extract_text_from_pdf(path)
    parsed = parse_cv_text(cv_text)

    return CvParseResult(
        text=parsed.profile_summary,
        name=parsed.name,
        university=parsed.university,
        graduation_year=parsed.graduation_year,
        skills=parsed.skills,
        queries=parsed.queries,
    )

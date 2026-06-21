"""Kullanıcıya Telegram üzerinden bildirim gönderme servisi.

Scraper Faz 6'da bunu kullanacak. `profile` ve `telegram_bot` arasındaki köprü:
- Kullanıcının chat_id'sini profile'dan çek
- Mesajı formatla
- telegram_bot.send_message ile gönder
- Telegram hatalarını yakala, sessizce logla (scraper akışı kesilmesin)
"""

import logging

import requests

from models.profile import Profile
from schemas.notification import JobNotification, ScanSummary
from services import telegram_bot


logger = logging.getLogger(__name__)


def _escape_markdown(text: str) -> str:
    """Telegram Markdown'da `_*[`]` karakterlerini güvenli hale getir."""
    return text.translate(str.maketrans({"_": r"\_", "*": r"\*", "[": r"\[", "`": r"\`"}))


def _format_job_message(job: JobNotification) -> str:
    title    = _escape_markdown(job.title)
    company  = _escape_markdown(job.company)
    location = _escape_markdown(job.location)
    summary  = _escape_markdown(job.summary)
    keywords = ", ".join(_escape_markdown(k) for k in job.matched_keywords) or "—"
    applicants_line = f"👥 {job.applicants}+ başvuran\n" if job.applicants else ""

    return (
        f"🔥 *{title}*\n"
        f"🏢 {company}\n"
        f"📍 {location}\n"
        f"⏰ {job.posted_at}\n"
        f"{applicants_line}"
        f"⭐ Puan: *{job.score}/100*\n\n"
        f"🧠 {summary}\n"
        f"✅ {keywords}\n"
        f"🔗 [İlana git]({job.url})"
    )


def _format_scan_summary(stats: ScanSummary) -> str:
    return (
        "✅ *Tarama tamamlandı*\n"
        f"Taranan: *{stats.scanned}* | Yeni: *{stats.new}* | Gönderilen: *{stats.sent}*"
    )


def _send_silently(profile: Profile, text: str) -> bool:
    """Kullanıcının chat_id'si varsa mesajı gönder. Hata olursa logla, raise etme."""
    if not profile.telegram_chat_id:
        return False
    try:
        telegram_bot.send_message(chat_id=profile.telegram_chat_id, text=text)
        return True
    except requests.RequestException as exc:
        logger.warning(
            "Telegram send failed user_id=%s chat_id=%s err=%s",
            profile.user_id, profile.telegram_chat_id, exc,
        )
        return False


def send_job_notification(profile: Profile, job: JobNotification) -> bool:
    """İş ilanı bildirimi gönder. chat_id yoksa veya hata olursa False döner."""
    return _send_silently(profile, _format_job_message(job))


def send_scan_summary(profile: Profile, stats: ScanSummary) -> bool:
    """Tarama özetini gönder. chat_id yoksa veya hata olursa False döner."""
    return _send_silently(profile, _format_scan_summary(stats))

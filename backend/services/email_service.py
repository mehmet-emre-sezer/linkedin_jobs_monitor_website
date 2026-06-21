"""Email gönderme servisi.

Resend API key tanımlıysa gerçek email gönderir.
Değilse konsola yazar (development modu).
"""

import resend

from core.config import settings
from core.security import (
    EMAIL_VERIFICATION_PURPOSE,
    PASSWORD_RESET_PURPOSE,
    create_purpose_token,
)


def _send_email(to: str, subject: str, html: str) -> None:
    """Resend ile email gönder. API key yoksa konsola yaz."""
    if not settings.resend_api_key:
        print("=" * 60, flush=True)
        print(f"📧 EMAIL (mock — RESEND_API_KEY tanımlı değil)", flush=True)
        print(f"To: {to}", flush=True)
        print(f"Subject: {subject}", flush=True)
        print(f"HTML:\n{html}", flush=True)
        print("=" * 60, flush=True)
        return

    resend.api_key = settings.resend_api_key
    resend.Emails.send({
        "from": settings.email_from,
        "to": to,
        "subject": subject,
        "html": html,
    })


def send_verification_email(user_id: int, to: str) -> None:
    """Email doğrulama linki gönder."""
    token = create_purpose_token(
        user_id=user_id,
        purpose=EMAIL_VERIFICATION_PURPOSE,
        expire_minutes=settings.email_verification_expire_minutes,
    )
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"
    html = f"""
    <h2>JobRadar'a hoş geldin 👋</h2>
    <p>Hesabını aktifleştirmek için aşağıdaki butona tıkla:</p>
    <p><a href="{verify_url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">E-postamı doğrula</a></p>
    <p>Veya bu linki tarayıcına yapıştır:<br><a href="{verify_url}">{verify_url}</a></p>
    <p>Bu link 24 saat içinde geçersiz olacak.</p>
    """
    _send_email(to=to, subject="JobRadar — E-postanı doğrula", html=html)


def send_password_reset_email(user_id: int, to: str) -> None:
    """Parola sıfırlama linki gönder."""
    token = create_purpose_token(
        user_id=user_id,
        purpose=PASSWORD_RESET_PURPOSE,
        expire_minutes=settings.password_reset_expire_minutes,
    )
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    html = f"""
    <h2>Parola sıfırlama</h2>
    <p>Parolanı sıfırlamak için aşağıdaki butona tıkla:</p>
    <p><a href="{reset_url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Parolamı sıfırla</a></p>
    <p>Veya bu linki tarayıcına yapıştır:<br><a href="{reset_url}">{reset_url}</a></p>
    <p>Bu link 1 saat içinde geçersiz olacak.</p>
    <p>Eğer bu işlemi sen başlatmadıysan bu maili görmezden gelebilirsin.</p>
    """
    _send_email(to=to, subject="JobRadar — Parola sıfırlama", html=html)

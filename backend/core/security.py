from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from core.config import settings


# ── Şifre hash'leme ─────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Düz şifreyi bcrypt ile hash'le."""
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Düz şifre ile hash eşleşiyor mu?"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT token ────────────────────────────────────────────────────

def create_access_token(user_id: int) -> str:
    """Verilen kullanıcı id'si için JWT access token üret."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": str(user_id),     # subject — bu token kime ait
        "exp": expires_at,       # expiration time
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Token'ı doğrula ve içeriğini döndür. Hatalıysa exception fırlatır."""
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )


# ── Email doğrulama / parola sıfırlama token'ları ───────────────

EMAIL_VERIFICATION_PURPOSE = "email_verification"
PASSWORD_RESET_PURPOSE = "password_reset"
TELEGRAM_LINK_PURPOSE = "telegram_link"


def create_purpose_token(user_id: int, purpose: str, expire_minutes: int) -> str:
    """Belirli bir amaç (email doğrulama, parola sıfırlama) için kısa ömürlü token."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    payload = {
        "sub": str(user_id),
        "purpose": purpose,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_purpose_token(token: str, expected_purpose: str) -> int:
    """Token'ı doğrula. Amacı eşleşmiyorsa hata. Başarılıysa user_id döner."""
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("purpose") != expected_purpose:
        raise jwt.InvalidTokenError("Token amacı uyuşmuyor.")
    return int(payload["sub"])

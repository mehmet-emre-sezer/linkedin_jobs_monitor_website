"""Google id_token doğrulama."""

from dataclasses import dataclass

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from core.config import settings


@dataclass(frozen=True)
class GoogleUserInfo:
    google_id: str   # Google'da değişmez kullanıcı kimliği (sub)
    email: str
    is_email_verified: bool


def verify_google_id_token(token: str) -> GoogleUserInfo:
    """Google'dan gelen id_token'ı doğrula ve kullanıcı bilgisini döndür.

    Geçersizse google.auth.exceptions.GoogleAuthError fırlatır.
    """
    payload = id_token.verify_oauth2_token(
        token,
        google_requests.Request(),
        settings.google_client_id,
    )

    return GoogleUserInfo(
        google_id=payload["sub"],
        email=payload["email"],
        is_email_verified=bool(payload.get("email_verified", False)),
    )

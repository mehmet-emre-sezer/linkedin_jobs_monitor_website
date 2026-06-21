from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.exceptions import InvalidCredentialsError, UserNotFoundError
from services import profile_service, telegram_bot

router = APIRouter(prefix="/telegram", tags=["telegram"])


# ── Mesaj şablonları ────────────────────────────────────────────

GREETING_HELP = (
    "👋 Merhaba!\n\n"
    "Bu bot iş ilanlarını sana iletmek için hazırlandı.\n"
    "Bağlantıyı tamamlamak için site üzerinden gelen *özel link*e tıklamalısın.\n\n"
    "Sitedeki onboarding adımında 'Botu aç' butonunu kullan."
)

LINK_SUCCESS = (
    "✅ Hesabın bağlandı!\n\n"
    "Bundan sonra sana uygun iş ilanları buraya gelecek.\n"
    "İyi şanslar 🚀"
)

LINK_EXPIRED = (
    "⚠️ Bu bağlantı geçersiz veya süresi dolmuş.\n\n"
    "Lütfen siteden yeni bir link al ve tekrar dene."
)


def _verify_webhook_secret(
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
) -> None:
    """Telegram'dan gelen isteğin gerçekten Telegram'dan geldiğini doğrula."""
    if not settings.telegram_webhook_secret:
        return
    if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook secret.",
        )


def _handle_start_command(db: Session, chat_id: str, args: list[str]) -> str:
    """`/start <token>` — args boşsa rehber mesajı, doluysa eşleştirmeyi dene."""
    if not args:
        return GREETING_HELP

    link_token = args[0]
    try:
        profile_service.link_telegram_chat(db, link_token, chat_id)
    except (InvalidCredentialsError, UserNotFoundError):
        return LINK_EXPIRED

    return LINK_SUCCESS


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def telegram_webhook(
    update: dict,
    _: None = Depends(_verify_webhook_secret),
    db: Session = Depends(get_db),
) -> dict:
    """Telegram bot'tan gelen update'i işle.

    Şu an sadece `/start [token]` komutunu yakalıyor.
    """
    message = update.get("message") or {}
    text: str = (message.get("text") or "").strip()
    chat = message.get("chat") or {}
    chat_id = chat.get("id")

    if not chat_id or not text:
        return {"ok": True}

    if text.startswith("/start"):
        parts = text.split(maxsplit=1)
        args = parts[1].split() if len(parts) > 1 else []
        reply = _handle_start_command(db, str(chat_id), args)
        telegram_bot.send_message(chat_id=str(chat_id), text=reply)

    return {"ok": True}

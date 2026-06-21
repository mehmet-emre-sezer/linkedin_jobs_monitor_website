"""Telegram Bot API wrapper.

Bot kurulumu kullanıcının manuel adımı (BotFather → token).
Token .env'de TELEGRAM_BOT_TOKEN olarak tanımlı değilse mock moduna geçer:
gerçek istek atmaz, konsola yazar.
"""

import requests

from core.config import settings


TELEGRAM_API_BASE = "https://api.telegram.org/bot"


def _bot_url(method: str) -> str:
    return f"{TELEGRAM_API_BASE}{settings.telegram_bot_token}/{method}"


def is_configured() -> bool:
    return bool(settings.telegram_bot_token)


def send_message(chat_id: str, text: str, parse_mode: str = "Markdown") -> None:
    """Belirli bir chat_id'ye mesaj gönder. Bot token yoksa mock."""
    if not is_configured():
        print(f"📨 TELEGRAM (mock) → chat_id={chat_id}\n{text}", flush=True)
        return

    response = requests.post(
        _bot_url("sendMessage"),
        json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        },
        timeout=10,
    )
    response.raise_for_status()


def set_webhook(public_url: str) -> None:
    """Webhook URL'ini Telegram'a kaydet. Production deploy sırasında çağrılır."""
    if not is_configured():
        raise RuntimeError("TELEGRAM_BOT_TOKEN tanımlı değil.")

    response = requests.post(
        _bot_url("setWebhook"),
        json={
            "url": public_url,
            "secret_token": settings.telegram_webhook_secret,
            "allowed_updates": ["message"],
        },
        timeout=10,
    )
    response.raise_for_status()


def get_deep_link(start_param: str) -> str:
    """Kullanıcıyı bota yönlendiren deep link döndür."""
    return f"https://t.me/{settings.telegram_bot_username}?start={start_param}"

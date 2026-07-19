"""IP bazlı hız sınırlama — Redis üzerinde sabit pencere sayacı.

Celery'nin Redis'i paylaşıldığı için sayaç tüm replikalar arasında ortaktır
(process içi sayaç birden fazla instance'ta işe yaramaz).

Redis erişilemezse istek **engellenmez**: hız sınırı bir kolaylık önlemi, kimlik
doğrulama değil. Redis çöktüğünde kayıt/giriş de çökmesin diye açık kalırız.
"""

import logging
from collections.abc import Callable

import redis
from fastapi import HTTPException, Request, status

from core.config import settings

logger = logging.getLogger(__name__)

_client: redis.Redis | None = None


def _redis() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def _client_ip(request: Request) -> str:
    """Gerçek istemci IP'si. Railway/Vercel arkasında X-Forwarded-For gerekir."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # "client, proxy1, proxy2" — ilki gerçek istemci
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(*, max_requests: int, window_seconds: int, scope: str) -> Callable:
    """Belirtilen pencerede IP başına istek sayısını sınırlayan dependency üretir.

    Örn. `Depends(rate_limit(max_requests=5, window_seconds=3600, scope="register"))`
    """

    def dependency(request: Request) -> None:
        key = f"ratelimit:{scope}:{_client_ip(request)}"
        try:
            count = _redis().incr(key)
            if count == 1:
                _redis().expire(key, window_seconds)
        except redis.RedisError as exc:
            logger.warning("Hız sınırı kontrol edilemedi (Redis): %s", exc)
            return  # fail-open

        if count > max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Çok fazla deneme yaptın. Lütfen biraz sonra tekrar dene.",
                headers={"Retry-After": str(window_seconds)},
            )

    return dependency

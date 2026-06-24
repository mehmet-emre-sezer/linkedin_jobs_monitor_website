"""Arama tercihlerini kaydeder ve aktif SearchQuery'leri yeniden kurar.

query_mode'a göre:
  - manual → sadece tercihlerden deterministik sorgu
  - ai     → LLM ile (Groq); erişilemezse boş döner, deterministik'e düşülür
  - hybrid → ikisi birden (dedupe)
"""

import logging

from sqlalchemy.orm import Session

from models.profile import Profile
from models.search_query import SearchQuery
from schemas.profile import SearchPreferencesUpdate
from scraper.query_builder import build_queries_from_preferences
from services.profile_service import get_or_create_profile

logger = logging.getLogger(__name__)


def update_search_preferences(
    db: Session, user_id: int, data: SearchPreferencesUpdate
) -> Profile:
    """Tercihleri kaydet, sonra moda göre aktif sorguları yeniden kur."""
    profile = get_or_create_profile(db, user_id)
    profile.search_locations = data.search_locations
    profile.work_mode = data.work_mode
    profile.target_roles = data.target_roles
    profile.target_levels = data.target_levels
    profile.query_mode = data.query_mode
    db.commit()
    db.refresh(profile)

    _rebuild_active_queries(db, profile)
    return profile


def _rebuild_active_queries(db: Session, profile: Profile) -> None:
    deterministic = build_queries_from_preferences(
        profile.target_roles or [], profile.target_levels or []
    )

    queries: list[str] = []
    if profile.query_mode in ("manual", "hybrid"):
        queries.extend(deterministic)
    if profile.query_mode in ("ai", "hybrid"):
        queries.extend(_generate_ai_queries(profile))

    # ai modu boş döndüyse (Groq yok/hata) kullanıcı sorgusuz kalmasın
    if not queries:
        queries = deterministic

    queries = _dedupe(queries)
    if not queries:
        # Üretilecek sorgu yok (rol girilmemiş + LLM boş) — mevcut sorgulara dokunma
        return

    _replace_active(db, profile.user_id, queries)


def _generate_ai_queries(profile: Profile) -> list[str]:
    """LLM ile sorgu üret (best-effort). Groq yoksa/hata olursa loglayıp boş döner."""
    try:
        from scraper.query_generator import generate_queries

        parts: list[str] = []
        if profile.target_roles:
            parts.append("Hedef roller: " + ", ".join(profile.target_roles))
        if profile.target_levels:
            parts.append("Seviye: " + ", ".join(profile.target_levels))
        if profile.skills:
            parts.append("Beceriler: " + ", ".join(profile.skills))
        if profile.university:
            parts.append("Üniversite: " + profile.university)

        candidate_profile = "\n".join(parts) or (profile.cv_text or "")
        if not candidate_profile.strip():
            return []
        return generate_queries(candidate_profile)
    except Exception as exc:  # LLM/Groq erişilemezse scan akışını kesme
        logger.warning("AI sorgu üretimi atlandı: %s", exc)
        return []


def _dedupe(queries: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for query in queries:
        cleaned = query.strip()
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(cleaned)
    return result


def _replace_active(db: Session, user_id: int, queries: list[str]) -> None:
    """Mevcut aktif sorguları pasifleştir, yenilerini aktif olarak ekle."""
    db.query(SearchQuery).filter(
        SearchQuery.user_id == user_id, SearchQuery.is_active.is_(True)
    ).update({SearchQuery.is_active: False})
    for query_text in queries:
        db.add(SearchQuery(user_id=user_id, query_text=query_text, is_active=True))
    db.commit()

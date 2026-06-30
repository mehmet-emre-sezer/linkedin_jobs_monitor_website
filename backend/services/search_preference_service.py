"""Arama tercihlerini kaydeder ve aktif SearchQuery'leri yeniden kurar.

Sorgular YALNIZCA kullanıcının tercihlerinden (rol + seviye) deterministik olarak
kurulur. AI sorgu ÜRETMEZ; query_optimizer onları zamanla performansa göre rafine eder.
"""

from sqlalchemy.orm import Session

from models.profile import Profile
from models.search_query import SearchQuery
from schemas.profile import SearchPreferencesUpdate
from scraper.query_builder import build_queries_from_preferences
from services.profile_service import get_or_create_profile


def update_search_preferences(
    db: Session, user_id: int, data: SearchPreferencesUpdate
) -> Profile:
    """Tercihleri kaydet, sonra aktif sorguları tercihlerden yeniden kur."""
    profile = get_or_create_profile(db, user_id)
    profile.search_locations = data.search_locations
    profile.work_mode = data.work_mode
    profile.target_roles = data.target_roles
    profile.target_levels = data.target_levels
    db.commit()
    db.refresh(profile)

    _rebuild_active_queries(db, profile)
    return profile


def _rebuild_active_queries(db: Session, profile: Profile) -> None:
    queries = _dedupe(
        build_queries_from_preferences(
            profile.target_roles or [], profile.target_levels or []
        )
    )
    if not queries:
        # Rol girilmemiş → kurulacak sorgu yok; mevcut sorgulara dokunma.
        return
    _replace_active(db, profile.user_id, queries)


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

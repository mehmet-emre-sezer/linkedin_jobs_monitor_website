from datetime import datetime, timezone

import jwt
from fastapi import UploadFile
from sqlalchemy.orm import Session

from core.config import settings
from core.exceptions import InvalidCredentialsError, UserNotFoundError
from core.security import (
    TELEGRAM_LINK_PURPOSE,
    create_purpose_token,
    decode_purpose_token,
)
from models.profile import Profile
from models.search_query import SearchQuery
from schemas.profile import ProfileBasicUpdate, SkillsUpdate
from services import cv_service, telegram_bot


def get_profile(db: Session, user_id: int) -> Profile | None:
    """Mevcut profili döndür. Yoksa None."""
    return db.query(Profile).filter(Profile.user_id == user_id).first()


def get_or_create_profile(db: Session, user_id: int) -> Profile:
    """Profili getir, yoksa boş profil yarat."""
    profile = get_profile(db, user_id)
    if profile is None:
        profile = Profile(user_id=user_id, skills=[])
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_basic_info(db: Session, user_id: int, data: ProfileBasicUpdate) -> Profile:
    """Onboarding adım 1: ad, üniversite, mezuniyet yılı."""
    profile = get_or_create_profile(db, user_id)
    profile.name = data.name
    profile.university = data.university
    profile.graduation_year = data.graduation_year
    db.commit()
    db.refresh(profile)
    return profile


def set_skills(db: Session, user_id: int, data: SkillsUpdate) -> Profile:
    """Onboarding adım 2: becerileri tek seferde set et."""
    profile = get_or_create_profile(db, user_id)
    profile.skills = data.skills
    db.commit()
    db.refresh(profile)
    return profile


def create_telegram_link(db: Session, user_id: int) -> str:
    """Telegram'a bağlanmak için kısa ömürlü deep link döndür."""
    get_or_create_profile(db, user_id)  # profil henüz yoksa hazırla
    token = create_purpose_token(
        user_id=user_id,
        purpose=TELEGRAM_LINK_PURPOSE,
        expire_minutes=settings.telegram_link_expire_minutes,
    )
    return telegram_bot.get_deep_link(start_param=token)


def link_telegram_chat(db: Session, link_token: str, chat_id: str) -> Profile:
    """Bot'tan gelen /start <token> komutuyla chat_id'yi profile'a kaydet."""
    try:
        user_id = decode_purpose_token(link_token, TELEGRAM_LINK_PURPOSE)
    except jwt.PyJWTError as exc:
        raise InvalidCredentialsError() from exc

    profile = get_profile(db, user_id)
    if profile is None:
        raise UserNotFoundError()

    profile.telegram_chat_id = str(chat_id)
    db.commit()
    db.refresh(profile)
    return profile


async def upload_and_parse_cv(db: Session, user_id: int, file: UploadFile) -> Profile:
    """Onboarding adım 3: CV'yi diske kaydet, parse et, eksik alanları doldur."""
    path, original_name = await cv_service.save_cv_file(user_id, file)
    parsed = cv_service.parse_cv(path)

    profile = get_or_create_profile(db, user_id)
    profile.cv_filename = original_name
    profile.cv_text = parsed.text
    profile.cv_uploaded_at = datetime.now(timezone.utc)

    # Boş alanları parse sonucuyla doldur (kullanıcı manuel girmiş olabilir, üzerine yazma)
    if not profile.name and parsed.name:
        profile.name = parsed.name
    if not profile.university and parsed.university:
        profile.university = parsed.university
    if not profile.graduation_year and parsed.graduation_year:
        profile.graduation_year = parsed.graduation_year

    # Becerilere yeni gelenleri ekle (mevcudu koru)
    existing_lower = {s.lower() for s in profile.skills}
    merged = list(profile.skills)
    for skill in parsed.skills:
        if skill.lower() not in existing_lower:
            merged.append(skill)
            existing_lower.add(skill.lower())
    profile.skills = merged

    # LLM'in ürettiği sorguları kaydet — kullanıcının mevcut aktif sorgusu yoksa
    if parsed.queries:
        _seed_initial_queries(db, user_id=user_id, queries=parsed.queries)

    db.commit()
    db.refresh(profile)
    return profile


def _seed_initial_queries(db: Session, *, user_id: int, queries: list[str]) -> None:
    """İlk CV yüklemesinde, kullanıcının henüz aktif sorgusu yoksa otomatik ekle.

    Optimizer (Faz 6G/6H) sorguları sonradan rafine eder; biz sadece başlangıcı veriyoruz.
    Kullanıcı zaten manuel sorgu eklemişse ona dokunmuyoruz.
    """
    has_active = (
        db.query(SearchQuery)
        .filter(SearchQuery.user_id == user_id, SearchQuery.is_active.is_(True))
        .first()
    )
    if has_active:
        return

    for query_text in queries:
        db.add(SearchQuery(user_id=user_id, query_text=query_text, is_active=True))

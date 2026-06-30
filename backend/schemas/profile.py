from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


MAX_SKILLS = 50
MAX_SKILL_LENGTH = 50

MAX_ROLES = 20
MAX_ROLE_LENGTH = 100
MAX_LEVELS = 10
MAX_LEVEL_LENGTH = 50
MAX_LOCATIONS = 10
MAX_LOCATION_LENGTH = 120


def _normalize_str_list(raw: list[str], *, max_item_length: int) -> list[str]:
    """strip + boş atla + case-insensitive dedupe + uzunluk kontrolü."""
    cleaned: list[str] = []
    seen: set[str] = set()
    for item in raw:
        value = item.strip()
        if not value:
            continue
        if len(value) > max_item_length:
            raise ValueError(f"En fazla {max_item_length} karakter olabilir: {value[:30]}…")
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(value)
    return cleaned


class ProfileBasicUpdate(BaseModel):
    """Onboarding adım 1: temel bilgiler."""
    name: str = Field(min_length=1, max_length=255)
    university: str = Field(min_length=1, max_length=255)
    graduation_year: int = Field(ge=1990, le=2035)


class SkillsUpdate(BaseModel):
    """Onboarding adım 2: beceriler."""
    skills: list[str] = Field(max_length=MAX_SKILLS)

    @field_validator("skills")
    @classmethod
    def normalize_and_dedupe(cls, raw_skills: list[str]) -> list[str]:
        cleaned: list[str] = []
        seen_lower: set[str] = set()
        for raw in raw_skills:
            skill = raw.strip()
            if not skill:
                continue
            if len(skill) > MAX_SKILL_LENGTH:
                raise ValueError(f"Beceri en fazla {MAX_SKILL_LENGTH} karakter olabilir: {skill[:30]}…")
            key = skill.lower()
            if key in seen_lower:
                continue
            seen_lower.add(key)
            cleaned.append(skill)
        return cleaned


class SearchPreferencesUpdate(BaseModel):
    """Kullanıcının arama tercihleri. Kaydedince aktif SearchQuery'ler yeniden kurulur."""
    search_locations: list[str] = Field(default_factory=list, max_length=MAX_LOCATIONS)
    work_mode: Literal["any", "remote", "hybrid", "onsite"] = "any"
    target_roles: list[str] = Field(default_factory=list, max_length=MAX_ROLES)
    target_levels: list[str] = Field(default_factory=list, max_length=MAX_LEVELS)

    @field_validator("search_locations")
    @classmethod
    def normalize_locations(cls, raw: list[str]) -> list[str]:
        return _normalize_str_list(raw, max_item_length=MAX_LOCATION_LENGTH)

    @field_validator("target_roles")
    @classmethod
    def normalize_roles(cls, raw: list[str]) -> list[str]:
        return _normalize_str_list(raw, max_item_length=MAX_ROLE_LENGTH)

    @field_validator("target_levels")
    @classmethod
    def normalize_levels(cls, raw: list[str]) -> list[str]:
        return _normalize_str_list(raw, max_item_length=MAX_LEVEL_LENGTH)


class ProfileResponse(BaseModel):
    """Frontend'e dönen profil."""
    name: str | None
    university: str | None
    graduation_year: int | None
    skills: list[str]
    cv_filename: str | None
    cv_uploaded_at: datetime | None
    telegram_chat_id: str | None
    onboarding_completed: bool
    search_locations: list[str]
    work_mode: str
    target_roles: list[str]
    target_levels: list[str]
    updated_at: datetime

    class Config:
        from_attributes = True

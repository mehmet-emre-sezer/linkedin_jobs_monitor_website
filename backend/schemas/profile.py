from datetime import datetime
from pydantic import BaseModel, Field, field_validator


MAX_SKILLS = 50
MAX_SKILL_LENGTH = 50


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
    updated_at: datetime

    class Config:
        from_attributes = True

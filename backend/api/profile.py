from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from core.auth import get_current_user
from core.database import get_db
from core.exceptions import FileTooLargeError, InvalidFileTypeError
from models.user import User
from schemas.profile import (
    ProfileBasicUpdate,
    ProfileResponse,
    SearchPreferencesUpdate,
    SkillsUpdate,
)
from services import profile_service, search_preference_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Giriş yapmış kullanıcının profilini dön. Yoksa boş profil oluşturup dön."""
    profile = profile_service.get_or_create_profile(db, current_user.id)
    return profile


@router.put("/me/basic", response_model=ProfileResponse)
def update_basic(
    data: ProfileBasicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Onboarding adım 1: temel bilgileri kaydet."""
    profile = profile_service.update_basic_info(db, current_user.id, data)
    return profile


@router.put("/me/skills", response_model=ProfileResponse)
def update_skills(
    data: SkillsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Onboarding adım 2: becerileri kaydet."""
    profile = profile_service.set_skills(db, current_user.id, data)
    return profile


@router.put("/me/search-preferences", response_model=ProfileResponse)
def update_search_preferences(
    data: SearchPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Arama tercihlerini kaydet + moda göre aktif sorguları yeniden kur."""
    return search_preference_service.update_search_preferences(db, current_user.id, data)


@router.post("/me/complete-onboarding", response_model=ProfileResponse)
def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Onboarding son adımı: tamamlandı olarak işaretle."""
    profile = profile_service.complete_onboarding(db, current_user.id)
    return profile


@router.post("/me/telegram-link")
def create_telegram_link(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Kullanıcı için Telegram bot deep link'i döndür."""
    url = profile_service.create_telegram_link(db, current_user.id)
    return {"url": url}


@router.post("/me/cv", response_model=ProfileResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Onboarding adım 3: CV dosyasını yükle, parse et."""
    try:
        profile = await profile_service.upload_and_parse_cv(db, current_user.id, file)
    except InvalidFileTypeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz dosya tipi. PDF, DOC veya DOCX yükle.",
        )
    except FileTooLargeError:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Dosya en fazla 10 MB olabilir.",
        )
    return profile

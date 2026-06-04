from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import EmailAlreadyExistsError
from schemas.user import UserCreate, UserResponse
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/ping")
def ping():
    """Auth modülü çalışıyor mu testi."""
    return {"module": "auth", "status": "ok"}


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Yeni kullanıcı kaydı."""
    try:
        user = auth_service.register_user(db, data)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta zaten kayıtlı.",
        )
    return user

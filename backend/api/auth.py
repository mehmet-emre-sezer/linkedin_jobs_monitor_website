from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from google.auth.exceptions import GoogleAuthError

from core.auth import get_current_user
from core.database import get_db
from core.exceptions import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    UserNotFoundError,
)
from core.google_oauth import verify_google_id_token
from models.user import User
from schemas.user import (
    EmailOnlyRequest,
    GoogleLoginRequest,
    PasswordResetRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyEmailRequest,
)
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
    """Yeni kullanıcı kaydı. Doğrulama emaili gönderilir."""
    try:
        user = auth_service.register_user(db, data)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta zaten kayıtlı.",
        )
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    """E-posta ve şifre ile giriş."""
    try:
        user, token = auth_service.login_user(db, data)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre yanlış.",
        )
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Token'dan giriş yapmış kullanıcıyı dön."""
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Giriş yapmış kullanıcının hesabını ve tüm verisini kalıcı olarak sil."""
    auth_service.delete_account(db, current_user.id)


@router.post("/verify-email", response_model=UserResponse)
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)) -> UserResponse:
    """Email doğrulama token'ını kullanarak hesabı aktifleştir."""
    try:
        user = auth_service.verify_email(db, data.token)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama linki geçersiz veya süresi dolmuş.",
        )
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )
    return user


@router.post("/resend-verification", status_code=status.HTTP_204_NO_CONTENT)
def resend_verification(data: EmailOnlyRequest, db: Session = Depends(get_db)) -> None:
    """Doğrulama emailini tekrar gönder. Email kayıtlı değilse bile 204 dön (enumeration önlemi)."""
    auth_service.resend_verification_email(db, data.email)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(data: EmailOnlyRequest, db: Session = Depends(get_db)) -> None:
    """Parola sıfırlama emaili gönder. Email kayıtlı değilse bile 204 dön (enumeration önlemi)."""
    auth_service.request_password_reset(db, data.email)


@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Google id_token ile giriş veya yeni hesap aç."""
    try:
        google_user = verify_google_id_token(data.id_token)
    except (GoogleAuthError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google doğrulaması başarısız.",
        )

    user, token = auth_service.login_or_register_with_google(db, google_user)
    return TokenResponse(access_token=token, user=user)


@router.post("/reset-password", response_model=UserResponse)
def reset_password(data: PasswordResetRequest, db: Session = Depends(get_db)) -> UserResponse:
    """Parola sıfırlama token'ı ile yeni parolayı kaydet."""
    try:
        user = auth_service.reset_password(db, data.token, data.new_password)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sıfırlama linki geçersiz veya süresi dolmuş.",
        )
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )
    return user

from datetime import datetime, timezone

import jwt
from sqlalchemy.orm import Session

from core.exceptions import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    UserNotFoundError,
)
from core.google_oauth import GoogleUserInfo
from core.security import (
    EMAIL_VERIFICATION_PURPOSE,
    PASSWORD_RESET_PURPOSE,
    create_access_token,
    decode_purpose_token,
    hash_password,
    verify_password,
)
from models.profile import Profile
from models.user import User
from schemas.user import UserCreate, UserLogin
from services import email_service


def register_user(db: Session, data: UserCreate) -> User:
    """Yeni kullanıcı oluştur ve doğrulama emaili gönder."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise EmailAlreadyExistsError(data.email)

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    email_service.send_verification_email(user_id=new_user.id, to=new_user.email)

    return new_user


def login_user(db: Session, data: UserLogin) -> tuple[User, str]:
    """Email + şifre ile giriş. Başarılıysa (kullanıcı, token) döndürür."""
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise InvalidCredentialsError()

    user.last_seen_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(user_id=user.id)
    return user, token


def verify_email(db: Session, token: str) -> User:
    """Email doğrulama token'ını kullanarak kullanıcıyı verified yap."""
    try:
        user_id = decode_purpose_token(token, EMAIL_VERIFICATION_PURPOSE)
    except jwt.PyJWTError as exc:
        raise InvalidCredentialsError() from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError()

    user.is_email_verified = True
    db.commit()
    db.refresh(user)
    return user


def resend_verification_email(db: Session, email: str) -> None:
    """Doğrulama emailini yeniden gönder. Kullanıcı yoksa sessizce başarılı dön (enumeration önlemi)."""
    user = db.query(User).filter(User.email == email).first()
    if user and not user.is_email_verified:
        email_service.send_verification_email(user_id=user.id, to=user.email)


def request_password_reset(db: Session, email: str) -> None:
    """Parola sıfırlama emailini gönder. Kullanıcı yoksa sessizce başarılı dön."""
    user = db.query(User).filter(User.email == email).first()
    if user:
        email_service.send_password_reset_email(user_id=user.id, to=user.email)


def login_or_register_with_google(db: Session, google_user: GoogleUserInfo) -> tuple[User, str]:
    """Google ile gelen kullanıcıyı bul veya oluştur, JWT döndür.

    Google e-postayı doğrulamamışsa giriş reddedilir: doğrulanmamış adrese
    güvenirsek, kurbanın adresiyle Google hesabı açan biri mevcut hesabı ele
    geçirebilir.
    """
    if not google_user.is_email_verified:
        raise InvalidCredentialsError()

    # Önce google_id ile ara
    user = db.query(User).filter(User.google_id == google_user.google_id).first()

    # Google_id yoksa email ile eşleştir (mevcut hesabı bağla)
    if not user:
        user = db.query(User).filter(User.email == google_user.email).first()
        if user:
            user.google_id = google_user.google_id

    # Yine yoksa yeni hesap aç
    if not user:
        user = User(
            email=google_user.email,
            google_id=google_user.google_id,
            is_email_verified=google_user.is_email_verified,
        )
        db.add(user)
        db.flush()  # user.id lazım

        # Onboarding'de ad soyad hazır gelsin (kullanıcı değiştirebilir)
        db.add(Profile(user_id=user.id, skills=[], name=google_user.name or None))
    else:
        # Google e-postayı doğruladı (yukarıda garanti edildi) → bizde de doğrulanmış say
        user.is_email_verified = True

    user.last_seen_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id)
    return user, token


def reset_password(db: Session, token: str, new_password: str) -> User:
    """Token ile parolayı sıfırla."""
    try:
        user_id = decode_purpose_token(token, PASSWORD_RESET_PURPOSE)
    except jwt.PyJWTError as exc:
        raise InvalidCredentialsError() from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError()

    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def delete_account(db: Session, user_id: int) -> None:
    """Kullanıcıyı ve ilişkili tüm verisini sil.

    Profile / jobs / scan_runs / search_queries FK'leri CASCADE olduğu için
    onlar da silinir; error_logs.user_id ise SET NULL olur.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError()
    db.delete(user)
    db.commit()

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Kayıt isteği gövdesi."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Giriş isteği gövdesi."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """API'den geri dönen kullanıcı (şifre hash'siz)."""
    id: int
    email: EmailStr
    is_email_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Login başarılı olunca dönen token + kullanıcı bilgisi."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class EmailOnlyRequest(BaseModel):
    """Sadece email gerektiren işlemler (resend, password reset request)."""
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str


class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class GoogleLoginRequest(BaseModel):
    """Frontend'in Google'dan aldığı id_token'ı backend'e iletmesi."""
    id_token: str

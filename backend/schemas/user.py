from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Kayıt isteği gövdesi."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    """API'den geri dönen kullanıcı (şifre hash'siz)."""
    id: int
    email: EmailStr
    is_email_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

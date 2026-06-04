from sqlalchemy.orm import Session

from core.exceptions import EmailAlreadyExistsError
from core.security import hash_password
from models.user import User
from schemas.user import UserCreate


def register_user(db: Session, data: UserCreate) -> User:
    """Yeni kullanıcı oluştur."""
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

    return new_user

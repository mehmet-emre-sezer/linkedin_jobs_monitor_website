from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.config import settings


# DB ile konuşan motor
engine = create_engine(settings.database_url, echo=False)

# Her istekte yeni bir oturum (session) oluşturmak için fabrika
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Tüm modellerin miras alacağı taban sınıf
class Base(DeclarativeBase):
    pass


# FastAPI endpoint'leri için bağımlılık fonksiyonu
def get_db():
    """Her istek için bir DB session aç, bitince kapat."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

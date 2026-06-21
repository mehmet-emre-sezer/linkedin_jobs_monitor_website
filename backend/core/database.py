from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.config import settings


def _normalize_db_url(url: str) -> str:
    """Railway/Heroku gibi sağlayıcılar `postgresql://...` döner.

    SQLAlchemy default'ta psycopg2 driver'ı arar; biz psycopg v3 kullanıyoruz.
    Driver hint'i yoksa ekleyelim.
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+psycopg" not in url:
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


# DB ile konuşan motor
engine = create_engine(_normalize_db_url(settings.database_url), echo=False)

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

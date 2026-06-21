from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from api import auth, profile, telegram, dashboard, admin


class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    default_response_class=UTF8JSONResponse,
)

# CORS — dev ortamı + production frontend URL'leri
# settings.cors_origins virgülle ayrılmış env'den (örn. "https://app.example.com,https://www.example.com")
_DEV_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_extra_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_DEV_ORIGINS + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modül router'larını bağla
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(telegram.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "JobRadar API çalışıyor 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}

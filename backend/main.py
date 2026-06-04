from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from api import auth


class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    default_response_class=UTF8JSONResponse,
)

# CORS — frontend dev sunucularının istek atabilmesi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modül router'larını bağla
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "JobRadar API çalışıyor 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "İş Pusulası API"
    app_version: str = "0.1.0"

    database_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 gün
    email_verification_expire_minutes: int = 1440  # 24 saat
    password_reset_expire_minutes: int = 60  # 1 saat

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Production'da Vercel URL'lerini virgülle ekle
    # örn. CORS_ORIGINS=https://jobradar.vercel.app,https://www.jobradar.com
    cors_origins: str = ""

    # Email — Resend
    resend_api_key: str = ""
    email_from: str = "onboarding@resend.dev"

    # Google OAuth
    google_client_id: str = ""

    # Telegram bot
    telegram_bot_token: str = ""
    telegram_bot_username: str = "jobradar_bot"
    telegram_webhook_secret: str = ""
    telegram_link_expire_minutes: int = 30

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Scraper
    search_location: str = "Istanbul, Turkey"
    jobs_per_query: int = 15
    score_threshold: int = 70
    optimize_every_n_runs: int = 10
    scraper_mode: str = "mock"  # "mock" | "selenium"

    # Selenium için Chrome yolları. Boşsa Selenium Manager otomatik bulur (lokal Mac).
    # Container'da Dockerfile bunları set eder (chromium + chromedriver).
    chrome_binary: str = ""
    chromedriver_path: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

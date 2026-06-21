# Deploy Rehberi

## Mimari

```
Vercel (frontend)  ──HTTPS──>  Railway
                                ├── Postgres (storage)
                                ├── Redis (broker + cache)
                                ├── Web service (FastAPI uvicorn)
                                ├── Worker service (Celery worker)
                                └── Beat service (Celery beat)
```

5 Railway service (DB + Redis + 3 process) → backend repo'sundan paylaşımlı build.

---

## 1) Backend — Railway

### a) Repo'yu Railway'e bağla

1. Railway dashboard → **New Project** → **Deploy from GitHub repo**
2. `linkedin_jobs_monitor_website` reposunu seç
3. Build root: `backend/` (Settings → Service → Root Directory)

### b) Postgres + Redis ekle

Aynı project altında:

1. **+ New** → **Database** → **PostgreSQL**
2. **+ New** → **Database** → **Redis**

Railway her ikisi için `DATABASE_URL` ve `REDIS_URL` env değişkenlerini otomatik üretir.

### c) Web service (FastAPI)

1. İlk eklenen service `web` rolünü alır
2. Settings → Service → **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Settings → Service → **Pre-Deploy Command**: `alembic upgrade head`
4. Variables sekmesinde ekle:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}        # Postgres service referansı (Railway lookup)
REDIS_URL=${{Redis.REDIS_URL}}                  # Redis service referansı
JWT_SECRET=<openssl rand -hex 32 çıktısı>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
EMAIL_VERIFICATION_EXPIRE_MINUTES=1440
PASSWORD_RESET_EXPIRE_MINUTES=60
FRONTEND_URL=https://<senin-vercel-url>.vercel.app
CORS_ORIGINS=https://<senin-vercel-url>.vercel.app

# Opsiyonel — boş bırakırsan mock modlar çalışır
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=jobradar_bot
TELEGRAM_WEBHOOK_SECRET=<openssl rand -hex 24>
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
SCRAPER_MODE=mock
SCORE_THRESHOLD=70
SEARCH_LOCATION=Istanbul, Turkey
JOBS_PER_QUERY=15
```

5. Deploy → public URL kopyala (örn. `https://jobradar-web.up.railway.app`)

### d) Worker service

1. **+ New** → **Empty service** veya aynı repo'dan ek service kur (same source)
2. Start Command: `celery -A tasks.celery_app worker --loglevel=info --concurrency=1`
3. Variables: web ile **aynı** (referenced variables)

### e) Beat service

1. Aynı yöntem
2. Start Command: `celery -A tasks.celery_app beat --loglevel=info`
3. Variables: aynı
4. **Sadece 1 instance** çalışmalı (replica=1)

### f) Migration

`Pre-Deploy Command: alembic upgrade head` web service'inde ayarlı.
Yeni deploy'da migration otomatik çalışır.

---

## 2) Frontend — Vercel

1. Vercel dashboard → **Add New Project** → GitHub repo seç
2. Root directory: `frontend/`
3. Framework: Next.js (otomatik detect)
4. Environment Variables:

```
NEXT_PUBLIC_API_URL=https://<senin-railway-url>.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=    # opsiyonel
```

5. **Deploy**
6. Vercel URL'i kopyala → Railway web service'in `CORS_ORIGINS` ve `FRONTEND_URL` env'lerine ekle, redeploy et

---

## 3) İlk smoke test

1. `https://<vercel-url>/register` → kayıt ol
2. Backend mock email gönderir (Railway loglarında görülür)
3. `https://<vercel-url>/login` → giriş
4. Dashboard mock veri ile boş gözükür
5. Worker logları: Beat saatleri geldiğinde `enqueue_all_user_scans` çalışır

---

## 4) İleride eklenecek key'ler

- **Resend API key** → gerçek email → kayıt linki kullanıcının kutusuna düşer
- **Groq API key** → gerçek LLM scoring + CV parse
- **Telegram BOT token** → gerçek bildirim, `/start <token>` ile chat eşleştirme
- **Google OAuth Client ID** → Google ile giriş butonu

Her birini Railway env'e ekledikten sonra ilgili service'i redeploy et.

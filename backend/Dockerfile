# İş Pusulası backend — Selenium için Chromium içeren image.
# Aynı image web / worker / beat servisleri için kullanılır; Chrome yalnızca
# worker'daki scan task'ında çalışır (web/beat başlatmaz).
FROM python:3.12-slim

# Chromium + eşleşen driver + fontlar
RUN apt-get update && apt-get install -y --no-install-recommends \
        chromium \
        chromium-driver \
        fonts-liberation \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Selenium bu yolları core.config.settings üzerinden okur (chrome_binary / chromedriver_path)
ENV CHROME_BINARY=/usr/bin/chromium \
    CHROMEDRIVER_PATH=/usr/bin/chromedriver \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Varsayılan = web. Worker/Beat servisleri Railway Custom Start Command ile override eder.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]

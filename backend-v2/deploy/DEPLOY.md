# İş Pusulası — EC2 Deploy Adımları

Elastic IP + DNS A kaydı (api.domain → Elastic IP) hazır olduktan sonra:

## 1. SSH bağlan
```bash
chmod 400 ispusulasi-key.pem
ssh -i ispusulasi-key.pem ubuntu@<ELASTIC_IP>
```

## 2. Docker + compose + nginx + certbot kur
```bash
sudo apt update && sudo apt upgrade -y
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
# nginx + certbot
sudo apt install -y nginx certbot python3-certbot-nginx git
# SSH'tan çık-gir (docker grubu aktif olsun)
exit
```
(Tekrar `ssh -i ... ubuntu@<ELASTIC_IP>`)

## 3. Repoyu çek
```bash
git clone <REPO_URL> ispusulasi
cd ispusulasi/backend-v2
```

## 4. Secret'ları gir
```bash
cp .env.example .env
nano .env   # ZORUNLU alanları doldur: DB_*, JWT_SECRET, GEMINI_API_KEY, domain'ler
```

## 5. Container'ları ayağa kaldır (ilk build ~birkaç dk)
```bash
docker compose up -d --build
docker compose logs -f app   # "Started BackendApplication" görünce Ctrl+C
curl http://127.0.0.1:8080/health   # {"status":"ok"} bekliyoruz
```

## 6. nginx reverse proxy
```bash
sudo cp deploy/nginx-ispusulasi.conf /etc/nginx/sites-available/ispusulasi
# conf içindeki server_name'i kendi subdomain'inle değiştir:
sudo nano /etc/nginx/sites-available/ispusulasi
sudo ln -sf /etc/nginx/sites-available/ispusulasi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. HTTPS (certbot — sertifika + otomatik yenileme)
```bash
sudo certbot --nginx -d api.senin-domainin.com
# Test: https://api.senin-domainin.com/health
```

## 8. Frontend'i bağla (lokalde, sonra Vercel'e birlikte push)
- `frontend/.env` (Vercel env): `NEXT_PUBLIC_API_URL=https://api.senin-domainin.com`
- Frontend değişikliklerini commit + push → Vercel deploy

## 9. Telegram webhook kaydı
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://api.senin-domainin.com/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Güncelleme (sonradan kod değişince)
```bash
cd ~/ispusulasi && git pull && cd backend-v2 && docker compose up -d --build
```

# Devlog — linkedin_jobs_monitor_website

---

## [2026-04-20] Landing Page

**Ne yapıldı:**
- React + Vite + Tailwind kurulumu tamamlandı (`frontend/`)
- `APP_NAME` tek yerden değişen sabit olarak tanımlandı (`src/constants/app.js`)
- Dark theme landing page yazıldı: Hero, Nasıl Çalışır, Ne Yapıyor, Footer CTA
- Hero'ya Telegram bildirim mock'u eklendi (sahte ilan + günlük özet kartı)
- Mobil uyumluluk sağlandı: section padding'ler `py-10 lg:py-16` olarak düzenlendi

**Dosyalar:**
- `frontend/src/pages/Landing.jsx`
- `frontend/src/constants/app.js`
- `frontend/vite.config.js`
- `.claude/launch.json` (preview sunucu config)

**Notlar:**
- Marka adı henüz belirlenmedi; `APP_NAME = "JobRadar"` placeholder olarak kullanılıyor
- `/register`, `/` gibi route'lar henüz bağlı değil — router kurulmadı

---

## [2026-04-20] Register Sayfası

**Ne yapıldı:**
- `react-router-dom` kuruldu, `App.jsx`'e `BrowserRouter` + `Routes` eklendi
- Register sayfası yazıldı: e-posta + şifre + şifre tekrar alanları
- Güçlü parola kriterleri: 8 karakter, büyük/küçük harf, rakam, özel karakter — şifre alanına focus'ta canlı gösterim
- Şifre tekrar alanında eşleşme kontrolü + yeşil tik / kırmızı hata
- Şifre göster/gizle butonu her iki alanda da var
- Google OAuth butonu (henüz işlevsiz, backend bağlantısı yok)
- Submit sonrası "E-postanı kontrol et" ekranına geçiş (aynı kart içinde state değişimi)
- Mobil uyumlu

**Dosyalar:**
- `frontend/src/pages/Register.jsx`
- `frontend/src/App.jsx`

**Notlar:**
- Google OAuth ve gerçek API çağrısı backend hazır olunca bağlanacak
- `/login` route'u henüz yok, "Giriş yap" linki kırık

---

## [2026-04-20] Register Sayfası — Revizyon

**Ne yapıldı:**
- Split layout (sol form / sağ panel) getirildi, `max-lg:hidden` ile mobilde tek sütuna düşüyor
- Sağ panel: SVG illüstrasyon (`/public/auth-illustration.svg`) — red X'li düşük skorlu kartlar, mavi çerçeveli seçili ilan (87 puan), Telegram bildirimi
- Sağ panelde dot grid kaldırıldı, sol kenara yumuşak gradient geçiş eklendi
- Adım şeridi (`01→02→03`) açıklamalarla yeniden tasarlandı, border inline style ile görünür yapıldı
- "Hesabın var mı? Giriş yap" nav'dan kaldırılıp form altına hotlink olarak taşındı
- "Zaten hesabın var mı?" gri, "Giriş yap" beyaz — hover'da mavi

**Dosyalar:**
- `frontend/src/pages/Register.jsx`
- `frontend/public/auth-illustration.svg`

---

## [2026-04-20] Login Sayfası + Register Düzeltmeleri

**Ne yapıldı:**
- Login sayfası oluşturuldu — Register ile aynı split layout, sadece farklılıklar:
  - Şifre tekrar alanı yok, parola kriteri yok
  - "Giriş yap →" butonu
  - "Parolanı mı unuttun? **Parolanı sıfırla**" hotlink (gri + beyaz)
  - Alt satırda "Hesabın yok mu? Ücretsiz kayıt ol" linki
- Register + Login'de adım chiplerinin alta sarması düzeltildi: `flex-nowrap`, `overflow-x-auto`, padding küçültüldü (`px-2.5 py-1.5`)
- Sağ panel sol kenar gradientinin opaklığı %~25 azaltıldı — sağ panel artık daha az karanlık
- `/login` route'u `App.jsx`'e eklendi

**Dosyalar:**
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/App.jsx`

**Sıradaki:** Onboarding sayfası (profil bilgileri + CV yükleme)

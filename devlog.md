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

---

## [2026-05-07] Onboarding Sayfası

**Ne yapıldı:**
- 4 adımlı onboarding akışı oluşturuldu, scroll yok, her adım ekrana sığıyor
- Progress bar: tamamlanan adımlarda tik ikonu, aktif adımda mavi ring
- **Adım 1:** Ad soyad, üniversite, mezuniyet yılı — alanlar dolmadan "Devam et" disabled
- **Adım 2:** Beceri chip input — Enter ile ekle, Backspace ile sil, hızlı ekleme butonları (Python, SQL, ML, PyTorch örnek olarak açılır)
- **Adım 3:** CV yükleme — sürükle-bırak + dosya seç, yükleyince mock parse (1.4s), önizlemede isim/üniversite/yıl/beceriler gösterilir; CV parse sonucu Adım 1 ve 2'ye otomatik aktarılır
- **Adım 4:** Telegram bağlantısı — bot linki, 3 adımlı talimat, "Botu aç" butonu
- `/onboarding` route'u `App.jsx`'e eklendi

**Dosyalar:**
- `frontend/src/pages/Onboarding.jsx`
- `frontend/src/App.jsx`

**Notlar:**
- CV parse şu an mock (setTimeout + sabit veri) — backend hazır olunca API çağrısıyla değişecek
- Bot linki placeholder: `t.me/jobradar_bot` — gerçek bot kurulunca güncellenecek
- "Tamamla →" şu an `/dashboard`'a yönlendiriyor, dashboard henüz yok

**Sıradaki:** Dashboard sayfası

---

## [YAPILACAK] Clean Code Refactor — Frontend

Clean code ruleset incelemesi sonucu tespit edilen sorunlar. Backend bağlantısından önce yapılacak.

### 1. DRY — Tekrarlanan bileşenler (kritik)
- `RightPanel` bileşeni `Register.jsx` ve `Login.jsx`'te birebir kopyalanmış
- Google OAuth butonu SVG'si de her ikisinde tekrarlanıyor
- **Çözüm:** `frontend/src/components/auth/` klasörü aç, `RightPanel.jsx` ve `GoogleButton.jsx` olarak çıkar, her iki sayfada import et

### 2. Magic string / sabit dışında kalan değerler
- `BOT_URL = "https://t.me/jobradar_bot"` Step4 bileşeninin içinde tanımlı
- `min="2020"` `max="2030"` mezuniyet yılı sınırları hardcoded
- **Çözüm:** Hepsini `constants/app.js`'e taşı (`BOT_URL`, `GRADUATION_YEAR_MIN`, `GRADUATION_YEAR_MAX`)

### 3. Vague prop adı (`data`)
- `Step1` bileşeni `{ data, onChange }` alıyor — `data` rule 3'te yasak isimler listesinde
- **Çözüm:** `data` → `profileInfo` olarak yeniden adlandır

### 4. Nested ternary — okunaksız validation
- `canNext` değişkeni iç içe ternary ile hesaplanıyor:
  ```js
  const canNext = step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3 ? step3Valid : true
  ```
- **Çözüm:** `STEP_VALIDATORS` map'i kullan:
  ```js
  const STEP_VALIDATORS = { 1: step1Valid, 2: step2Valid, 3: step3Valid, 4: true }
  const canNext = STEP_VALIDATORS[step] ?? true
  ```

### 5. Global DOM id — `document.getElementById`
- `Step2`'de skill input'a focus için `document.getElementById("skill-input")` kullanılıyor
- Bileşen iki kez render olursa çakışır
- **Çözüm:** `id` kaldır, `useRef` ile direkt ref kullan

### 6. TODO'lar tracked değil
- 3 adet `// TODO:` yorum var (CV parse API, bot linki, dashboard yönlendirme)
- **Çözüm:** Her TODO'ya devlog referansı ekle, örn: `// TODO: bkz devlog - CV parse API`

---

## [2026-06-04] Next.js'e Migrasyon + Clean Code Refactor

**Ne yapıldı:**
- React + Vite projesinden **Next.js 16 + TypeScript + Tailwind**'e geçildi
- Dosya yapısı: `app/` (sayfalar), `components/` (bileşenler), `constants/` (sabitler), `public/` (statik dosyalar)
- Routing dosya bazlı: `app/page.tsx → /`, `app/login/page.tsx → /login` vb.
- Tüm sayfalar TypeScript'e taşındı, tipler tanımlandı (`ProfileInfo`, `ParsedCv` vs.)
- Ortak bileşenler `components/auth/` altına çıkarıldı: `RightPanel`, `GoogleButton`, `EyeIcon`, `StepChips`
- Onboarding'in `Step3` bileşeni iki parçaya bölündü: `CvUploadZone` (upload UI) ve `CvParsePreview` (analiz önizleme)
- Magic string'ler `constants/app.ts`'e taşındı: `BOT_URL`, `GRADUATION_YEAR_MIN/MAX`, `ONBOARDING_EXAMPLE_SKILLS`
- `data` prop adı `profileInfo` olarak yeniden adlandırıldı (ruleset 3)
- Nested ternary `STEP_VALIDATORS` map'e dönüştürüldü (ruleset 4)
- `document.getElementById` kaldırıldı, `useRef` ile değiştirildi
- Boolean isimlendirme düzeltildi: `isFormValid`, `isParsing`, `isDragging` vb.

**Dosyalar:**
- `frontend/app/` altındaki tüm sayfalar
- `frontend/components/auth/*` (4 ortak bileşen)
- `frontend/components/onboarding/*` (2 yeni bileşen)
- `frontend/constants/app.ts`

**Notlar:**
- Eski Vite projesi `frontend_backup/` olarak yedeklendi
- Build sıfır hata ile geçiyor

---

## [2026-06-04] Dashboard Sayfası

**Ne yapıldı:**
- `app/dashboard/page.tsx` ve `components/dashboard/` klasörü oluşturuldu
- 5 bileşen yazıldı:
  - `DashboardNav` — Üst navigation, logo + profil avatarı + dropdown menu
  - `StatusBanner` — Sıradaki tarama saati + Telegram bağlantı durumu
  - `StatCards` — 4 metrik kart (taranan, iletilen, ort. skor, max skor)
  - `RecentJobs` + `JobCard` — Son 10 ilan listesi, skor renklendirmesi (yeşil/mavi/gri), tıklanabilir kartlar
  - `QueryStats` + `StatRow` — Sorgu performansı paneli, skor için progress bar
- Profil dropdown'u dış tıklama ile kapanıyor (`useEffect` + `useRef` + `mousedown` listener)
- Boş durum (empty state) tüm listelerde mevcut — yeni kullanıcı için kullanıcı dostu mesajlar
- Layout: mobil tek sütun, geniş ekranda 2:1 grid (RecentJobs sol 2 sütun, QueryStats sağ 1 sütun)
- Skor barı için inline style ile dinamik genişlik (`width: ${score}%`)
- `constants/mockData.ts` oluşturuldu: `Job`, `QueryStat`, `DashboardSummary` tipleri + boş/dolu mock veriler
- Dashboard'da `USE_MOCK_DATA` flag'i ile boş/dolu durum test edilebiliyor

**Dosyalar:**
- `frontend/app/dashboard/page.tsx`
- `frontend/components/dashboard/` (5 dosya)
- `frontend/constants/mockData.ts`

**Notlar:**
- Mock veri default'ta boş (`USE_MOCK_DATA = true` ile dolu görülebilir)
- Backend bağlanınca `mockData.ts` silinecek, API çağrıları gelecek
- Dashboard'a eklenebilecekler ileride: zaman bazlı grafik, profil özeti widget'ı, son tarama detayı

**Sıradaki:** Admin panel veya Backend (FastAPI)

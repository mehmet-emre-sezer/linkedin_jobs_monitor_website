// Bu dosya geçici sahte veriler içerir.
// Backend hazır olunca silinip yerine API çağrıları gelecek.

// ── Tipler ──────────────────────────────────────────────────────

export interface Job {
  id: string
  title: string
  company: string
  location: string
  score: number
  postedAt: string  // YYYY-MM-DD
  applicants: number
  description: string
  matchedKeywords: string[]
  url: string
}

export interface QueryStat {
  query: string
  jobCount: number
  averageScore: number
}

export interface DashboardSummary {
  scannedThisWeek: number
  sentThisWeek: number
  averageScore: number
  maxScore: number
  nextScanAt: string         // "HH:mm" formatı
  isTelegramConnected: boolean
}

// ── Boş durum (yeni kullanıcı) ──────────────────────────────────

export const EMPTY_SUMMARY: DashboardSummary = {
  scannedThisWeek: 0,
  sentThisWeek: 0,
  averageScore: 0,
  maxScore: 0,
  nextScanAt: "18:00",
  isTelegramConnected: false,
}

export const EMPTY_JOBS: Job[] = []
export const EMPTY_QUERY_STATS: QueryStat[] = []

// ── Dolu durum (test için) ──────────────────────────────────────

export const MOCK_SUMMARY: DashboardSummary = {
  scannedThisWeek: 84,
  sentThisWeek: 12,
  averageScore: 76,
  maxScore: 92,
  nextScanAt: "18:00",
  isTelegramConnected: true,
}

export const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Junior ML Engineer",
    company: "Bir teknoloji şirketi",
    location: "İstanbul, Türkiye",
    score: 92,
    postedAt: "2026-06-03",
    applicants: 124,
    description: "Python, scikit-learn deneyimi olan, 0-2 yıl tecrübeli junior ML mühendisi.",
    matchedKeywords: ["Python", "Machine Learning", "scikit-learn"],
    url: "#",
  },
  {
    id: "2",
    title: "Data Science Intern",
    company: "Teknoloji A.Ş.",
    location: "Ankara, Türkiye",
    score: 87,
    postedAt: "2026-06-03",
    applicants: 89,
    description: "Veri bilimine ilgili, Python ve SQL bilen stajyer.",
    matchedKeywords: ["Python", "SQL", "Intern"],
    url: "#",
  },
  {
    id: "3",
    title: "Backend Developer (Python)",
    company: "Yazılım A.Ş.",
    location: "İstanbul (Remote)",
    score: 84,
    postedAt: "2026-06-02",
    applicants: 200,
    description: "Django/FastAPI ile API geliştirme, junior pozisyon.",
    matchedKeywords: ["Python", "FastAPI", "Backend"],
    url: "#",
  },
  {
    id: "4",
    title: "AI Engineer Trainee",
    company: "Startup",
    location: "İstanbul, Türkiye",
    score: 81,
    postedAt: "2026-06-02",
    applicants: 56,
    description: "LLM ve generative AI projelerinde çalışacak trainee.",
    matchedKeywords: ["AI", "LLM", "Python"],
    url: "#",
  },
  {
    id: "5",
    title: "Junior Data Analyst",
    company: "E-ticaret",
    location: "İzmir, Türkiye",
    score: 78,
    postedAt: "2026-06-01",
    applicants: 142,
    description: "SQL ve veri görselleştirme bilen junior analist.",
    matchedKeywords: ["SQL", "Data Analyst"],
    url: "#",
  },
  {
    id: "6",
    title: "MLOps Junior",
    company: "Banka",
    location: "İstanbul, Türkiye",
    score: 75,
    postedAt: "2026-06-01",
    applicants: 78,
    description: "ML modellerinin production'a alınması, Docker/K8s bilgisi.",
    matchedKeywords: ["MLOps", "Docker"],
    url: "#",
  },
  {
    id: "7",
    title: "Python Developer",
    company: "Yazılım Evi",
    location: "Bursa (Hibrit)",
    score: 73,
    postedAt: "2026-05-31",
    applicants: 90,
    description: "Backend Python geliştirme, junior/orta seviye.",
    matchedKeywords: ["Python", "Backend"],
    url: "#",
  },
  {
    id: "8",
    title: "Computer Vision Intern",
    company: "Otomotiv",
    location: "Kocaeli, Türkiye",
    score: 70,
    postedAt: "2026-05-31",
    applicants: 34,
    description: "OpenCV ve PyTorch ile bilgisayarlı görü projelerinde stajyer.",
    matchedKeywords: ["PyTorch", "Computer Vision"],
    url: "#",
  },
  {
    id: "9",
    title: "Junior Software Engineer",
    company: "Fintek",
    location: "İstanbul, Türkiye",
    score: 68,
    postedAt: "2026-05-30",
    applicants: 320,
    description: "Backend servisleri geliştirme, Python veya Go.",
    matchedKeywords: ["Python", "Backend"],
    url: "#",
  },
  {
    id: "10",
    title: "Data Engineer Trainee",
    company: "Telekom",
    location: "Ankara, Türkiye",
    score: 65,
    postedAt: "2026-05-30",
    applicants: 110,
    description: "ETL pipeline'ları, SQL, Airflow.",
    matchedKeywords: ["SQL", "Data Engineer"],
    url: "#",
  },
]

export const MOCK_QUERY_STATS: QueryStat[] = [
  { query: "Junior ML Engineer",       jobCount: 18, averageScore: 78 },
  { query: "Data Science Intern",      jobCount: 12, averageScore: 73 },
  { query: "Python Backend Junior",    jobCount: 24, averageScore: 71 },
  { query: "AI Engineer Trainee",      jobCount: 8,  averageScore: 76 },
  { query: "Computer Vision Intern",   jobCount: 5,  averageScore: 70 },
]

// ── Admin mock verileri ─────────────────────────────────────────

export interface AdminOverview {
  totalUsers: number
  activeUsers: number       // son 7 gün giriş yapmış
  registeredToday: number
  errorsLast24h: number
}

export const MOCK_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 247,
  activeUsers: 124,
  registeredToday: 8,
  errorsLast24h: 3,
}

// Funnel — kullanıcı yolculuğu
export interface FunnelStep {
  label: string
  userCount: number
}

export const MOCK_FUNNEL: FunnelStep[] = [
  { label: "Kayıt oldu",         userCount: 247 },
  { label: "E-posta doğruladı",  userCount: 198 },
  { label: "Onboarding başladı", userCount: 165 },
  { label: "CV yükledi",         userCount: 132 },
  { label: "Telegram bağladı",   userCount: 89  },
]

// Kullanıcı listesi
export type SubscriptionStatus = "free" | "paid"

export interface User {
  id: string
  name: string
  email: string
  registeredAt: string   // YYYY-MM-DD
  lastSeenAt: string     // YYYY-MM-DD
  subscription: SubscriptionStatus
  isTelegramConnected: boolean
}

export const MOCK_USERS: User[] = [
  { id: "u1",  name: "Mehmet Emre Sezer", email: "emre@gmail.com",    registeredAt: "2026-05-10", lastSeenAt: "2026-06-04", subscription: "paid", isTelegramConnected: true  },
  { id: "u2",  name: "Ayşe Yılmaz",       email: "ayse@gmail.com",    registeredAt: "2026-05-15", lastSeenAt: "2026-06-03", subscription: "free", isTelegramConnected: true  },
  { id: "u3",  name: "Can Demir",         email: "can@outlook.com",   registeredAt: "2026-05-20", lastSeenAt: "2026-06-04", subscription: "paid", isTelegramConnected: true  },
  { id: "u4",  name: "Zeynep Kaya",       email: "zeynep@gmail.com",  registeredAt: "2026-05-22", lastSeenAt: "2026-05-30", subscription: "free", isTelegramConnected: false },
  { id: "u5",  name: "Mert Aslan",        email: "mert@gmail.com",    registeredAt: "2026-05-25", lastSeenAt: "2026-06-02", subscription: "paid", isTelegramConnected: true  },
  { id: "u6",  name: "Selin Aydın",       email: "selin@hotmail.com", registeredAt: "2026-05-28", lastSeenAt: "2026-06-04", subscription: "free", isTelegramConnected: true  },
  { id: "u7",  name: "Burak Öz",          email: "burak@gmail.com",   registeredAt: "2026-06-01", lastSeenAt: "2026-06-01", subscription: "free", isTelegramConnected: false },
  { id: "u8",  name: "Ece Çelik",         email: "ece@gmail.com",     registeredAt: "2026-06-02", lastSeenAt: "2026-06-03", subscription: "paid", isTelegramConnected: true  },
]

// Kullanıcı detay
export interface UserDetail {
  id: string
  university: string
  graduationYear: string
  skills: string[]
  chatId: string | null
  totalJobsScanned: number
  totalJobsSent: number
  averageScore: number
}

export const MOCK_USER_DETAILS: Record<string, UserDetail> = {
  u1: { id: "u1", university: "İstanbul Teknik Üniversitesi", graduationYear: "2025", skills: ["Python", "Machine Learning", "SQL", "PyTorch"], chatId: "874512983", totalJobsScanned: 1240, totalJobsSent: 84,  averageScore: 76 },
  u2: { id: "u2", university: "Boğaziçi Üniversitesi",        graduationYear: "2024", skills: ["Python", "Data Analysis", "SQL"],               chatId: "112233445", totalJobsScanned: 890,  totalJobsSent: 52,  averageScore: 71 },
  u3: { id: "u3", university: "ODTÜ",                          graduationYear: "2025", skills: ["JavaScript", "React", "Node.js"],               chatId: "998877665", totalJobsScanned: 1560, totalJobsSent: 110, averageScore: 78 },
  u4: { id: "u4", university: "Yıldız Teknik",                graduationYear: "2026", skills: ["Java", "Spring Boot"],                          chatId: null,        totalJobsScanned: 0,    totalJobsSent: 0,   averageScore: 0  },
}

// Hata logları
export type ErrorSeverity = "error" | "warning" | "info"
export type ErrorSource = "scraper" | "scorer" | "telegram" | "database" | "auth"

export interface ErrorLog {
  id: string
  timestamp: string         // ISO format
  severity: ErrorSeverity
  source: ErrorSource
  userId: string | null     // sistemsel hata için null
  message: string
  stackTrace: string
}

export const MOCK_ERROR_LOGS: ErrorLog[] = [
  {
    id: "e1",
    timestamp: "2026-06-04 14:23:12",
    severity: "error",
    source: "scraper",
    userId: "u1",
    message: "LinkedIn DOM selector bulunamadı: '.job-card-container'",
    stackTrace: `File "scraper.py", line 87, in extract_jobs
    cards = driver.find_elements(By.CLASS_NAME, "job-card-container")
selenium.common.exceptions.NoSuchElementException: Unable to locate element`,
  },
  {
    id: "e2",
    timestamp: "2026-06-04 13:45:03",
    severity: "warning",
    source: "telegram",
    userId: "u4",
    message: "Telegram bot kullanıcıya mesaj gönderemedi: chat_id geçersiz",
    stackTrace: `telegram.error.BadRequest: Chat not found
File "notifier.py", line 42, in send_notification
    bot.send_message(chat_id=user.chat_id, text=msg)`,
  },
  {
    id: "e3",
    timestamp: "2026-06-04 12:10:55",
    severity: "error",
    source: "scorer",
    userId: null,
    message: "Groq API rate limit aşıldı",
    stackTrace: `groq.RateLimitError: 429 Too Many Requests
Retry-After: 60s
File "scorer.py", line 23, in score_job`,
  },
  {
    id: "e4",
    timestamp: "2026-06-04 09:32:18",
    severity: "info",
    source: "database",
    userId: null,
    message: "Database backup tamamlandı",
    stackTrace: `Backup size: 124 MB
Duration: 2m 34s
Location: s3://jobradar-backups/2026-06-04.tar.gz`,
  },
  {
    id: "e5",
    timestamp: "2026-06-03 18:55:42",
    severity: "error",
    source: "auth",
    userId: "u7",
    message: "JWT token doğrulama başarısız",
    stackTrace: `jwt.exceptions.ExpiredSignatureError: Signature has expired
File "auth.py", line 56, in verify_token`,
  },
]

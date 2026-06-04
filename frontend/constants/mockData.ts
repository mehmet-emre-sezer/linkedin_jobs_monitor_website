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

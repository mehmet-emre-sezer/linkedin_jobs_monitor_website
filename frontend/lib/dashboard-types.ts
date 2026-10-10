// Backend (FastAPI) dashboard endpoint response tipleri — snake_case.

export interface BackendDashboardSummary {
  scannedThisWeek: number
  sentThisWeek: number
  averageScore: number
  maxScore: number
  nextScanAt: string
  telegramConnected: boolean
}

export interface BackendJobItem {
  id: number
  title: string
  company: string
  location: string
  score: number
  postedAt: string | null
  applicants: number | null
  summary: string | null
  matchedKeywords: string[]
  url: string
  createdAt: string
}

export interface BackendQueryStat {
  query: string
  jobCount: number
  averageScore: number
}

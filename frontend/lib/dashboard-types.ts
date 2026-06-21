// Backend (FastAPI) dashboard endpoint response tipleri — snake_case.

export interface BackendDashboardSummary {
  scanned_this_week: number
  sent_this_week: number
  average_score: number
  max_score: number
  next_scan_at: string
  is_telegram_connected: boolean
}

export interface BackendJobItem {
  id: number
  title: string
  company: string
  location: string
  score: number
  posted_at: string | null
  applicants: number | null
  summary: string | null
  matched_keywords: string[]
  url: string
  created_at: string
}

export interface BackendQueryStat {
  query: string
  job_count: number
  average_score: number
}

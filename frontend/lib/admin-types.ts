// Admin endpoint'lerinin backend (snake_case) response tipleri + camelCase adapter'lar.
// Component'ler camelCase view tiplerini bekliyor (mockData'daki tipler).

import type { AdminOverview, FunnelStep, User, ErrorLog } from "@/constants/mockData"

// ── Backend response tipleri ───────────────────────────────────

export interface AdminOverviewResponse {
  total_users: number
  active_users: number
  registered_today: number
  errors_last_24h: number
}

export interface FunnelStepResponse {
  label: string
  user_count: number
}

export interface AdminUserItemResponse {
  id: number
  name: string | null
  email: string
  registered_at: string
  last_seen_at: string
  subscription: string
  is_telegram_connected: boolean
}

export interface AdminUserDetailResponse {
  id: number
  email: string
  name: string | null
  registered_at: string
  last_seen_at: string
  subscription: string
  university: string | null
  graduation_year: number | null
  skills: string[]
  telegram_chat_id: string | null
  total_jobs_scanned: number
  total_jobs_sent: number
  average_score: number
}

export interface AdminErrorLogResponse {
  id: number
  timestamp: string
  severity: string
  source: string
  user_id: number | null
  message: string
  stack_trace: string | null
}

// Detay sayfası için tek birleşik view tipi (hesap + profil + istatistik).
export interface UserDetailView {
  id: string
  name: string
  email: string
  subscription: "free" | "paid"
  registeredAt: string
  lastSeenAt: string
  isTelegramConnected: boolean
  university: string | null
  graduationYear: number | null
  skills: string[]
  chatId: string | null
  totalJobsScanned: number
  totalJobsSent: number
  averageScore: number
}

// ── Adapter'lar (snake_case → camelCase) ───────────────────────

function isoToDate(iso: string): string {
  return iso.slice(0, 10) // "2026-06-23T12:00:00" → "2026-06-23"
}

function toSubscription(value: string): "free" | "paid" {
  return value === "paid" ? "paid" : "free"
}

export function adaptOverview(r: AdminOverviewResponse): AdminOverview {
  return {
    totalUsers: r.total_users,
    activeUsers: r.active_users,
    registeredToday: r.registered_today,
    errorsLast24h: r.errors_last_24h,
  }
}

export function adaptFunnel(rows: FunnelStepResponse[]): FunnelStep[] {
  return rows.map((r) => ({ label: r.label, userCount: r.user_count }))
}

export function adaptUser(r: AdminUserItemResponse): User {
  return {
    id: String(r.id),
    name: r.name ?? r.email, // ismi olmayan kullanıcı için email'i göster
    email: r.email,
    registeredAt: isoToDate(r.registered_at),
    lastSeenAt: isoToDate(r.last_seen_at),
    subscription: toSubscription(r.subscription),
    isTelegramConnected: r.is_telegram_connected,
  }
}

export function adaptUserDetail(r: AdminUserDetailResponse): UserDetailView {
  return {
    id: String(r.id),
    name: r.name ?? r.email,
    email: r.email,
    subscription: toSubscription(r.subscription),
    registeredAt: isoToDate(r.registered_at),
    lastSeenAt: isoToDate(r.last_seen_at),
    isTelegramConnected: r.telegram_chat_id != null,
    university: r.university,
    graduationYear: r.graduation_year,
    skills: r.skills,
    chatId: r.telegram_chat_id,
    totalJobsScanned: r.total_jobs_scanned,
    totalJobsSent: r.total_jobs_sent,
    averageScore: r.average_score,
  }
}

export function adaptErrorLog(r: AdminErrorLogResponse): ErrorLog {
  return {
    id: String(r.id),
    timestamp: r.timestamp.replace("T", " ").slice(0, 19),
    severity: r.severity as ErrorLog["severity"],
    source: r.source as ErrorLog["source"],
    userId: r.user_id != null ? String(r.user_id) : null,
    message: r.message,
    stackTrace: r.stack_trace ?? "",
  }
}

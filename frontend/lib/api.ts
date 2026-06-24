import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TOKEN_KEY = "jobradar_token"

// ── Token yönetimi ──────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

// ── Axios instance ──────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
})

// Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 alırsak token'ı temizle, kullanıcıyı login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken()
      // Sadece korumalı sayfalardayken yönlendir
      const path = window.location.pathname
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/admin") ||
        path.startsWith("/profile") ||
        path.startsWith("/settings")
      if (isProtected) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

// ── Hata mesajı normalleştirme ─────────────────────────────────

interface ApiErrorDetail {
  loc?: (string | number)[]
  msg: string
  type?: string
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail

    // Pydantic validation hatası (422) — dizi olarak gelir
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as ApiErrorDetail
      return first.msg
    }

    // HTTPException — string olarak gelir
    if (typeof detail === "string") {
      return detail
    }
  }

  return "Beklenmeyen bir hata oluştu. Lütfen tekrar dene."
}

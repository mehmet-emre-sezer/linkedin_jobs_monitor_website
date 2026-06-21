"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { api, extractErrorMessage } from "@/lib/api"
import AuthCard from "@/components/auth/AuthCard"
import EyeIcon from "@/components/auth/EyeIcon"

const passwordCriteria = [
  { label: "En az 8 karakter",      test: (p: string) => p.length >= 8 },
  { label: "Büyük harf",            test: (p: string) => /[A-Z]/.test(p) },
  { label: "Küçük harf",            test: (p: string) => /[a-z]/.test(p) },
  { label: "Rakam",                 test: (p: string) => /[0-9]/.test(p) },
  { label: "Özel karakter (!@#...)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
]

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard><div className="text-center py-6 text-gray-500 text-sm">Yükleniyor…</div></AuthCard>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [pwTouched, setPwTouched] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState("")

  const allMet = passwordCriteria.every((c) => c.test(password))
  const passwordsMatch = password === confirm && confirm.length > 0
  const isFormValid = !!token && allMet && passwordsMatch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token, new_password: password })
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Parola güncellendi</h1>
          <p className="text-gray-400 text-sm">Giriş sayfasına yönlendiriliyorsun…</p>
        </div>
      </AuthCard>
    )
  }

  if (!token) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Geçersiz link</h1>
          <p className="text-gray-400 text-sm mb-6">Sıfırlama linki eksik veya hatalı.</p>
          <Link href="/forgot-password" className="inline-block w-full text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
            Yeni link iste
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-white mb-1">Yeni parola</h1>
      <p className="text-gray-500 text-sm mb-6">Hesabın için yeni bir parola belirle.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Yeni parola</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwTouched(true)}
              placeholder="En az 8 karakter"
              className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              <EyeIcon open={showPw} />
            </button>
          </div>

          {pwTouched && (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {passwordCriteria.map((c) => {
                const ok = c.test(password)
                return (
                  <div key={c.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-400" : "text-gray-600"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400" : "bg-gray-700"}`} />
                    {c.label}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Tekrar gir</label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Parolanı tekrar gir"
            className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none transition-colors ${
              confirm.length > 0
                ? passwordsMatch ? "border-green-500/50" : "border-red-500/40"
                : "border-white/[0.09] focus:border-blue-500/60"
            }`}
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-400 mt-2">Parolalar eşleşmiyor</p>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all"
        >
          {loading ? "Kaydediliyor…" : "Parolayı güncelle"}
        </button>
      </form>
    </AuthCard>
  )
}

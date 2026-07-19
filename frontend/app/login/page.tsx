"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { APP_NAME } from "@/constants/app"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { resolvePostLoginPath } from "@/lib/post-login-redirect"
import type { TokenResponse } from "@/lib/auth-types"
import RightPanel from "@/components/auth/RightPanel"
import GoogleButton from "@/components/auth/GoogleButton"
import EyeIcon from "@/components/auth/EyeIcon"
import StepChips from "@/components/auth/StepChips"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const isFormValid = email.includes("@") && password.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setError("")
    setLoading(true)
    try {
      const { data } = await api.post<TokenResponse>("/auth/login", { email, password })
      login(data)

      // Admin → direkt panel (onboarding akışına girmez).
      // is_admin backend'den geliyor; gerçek güvenlik require_admin + AdminGuard'da.
      router.push(await resolvePostLoginPath(data.user))
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0f1117] grid grid-cols-1 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-6">
          <Link href="/" className="text-white font-bold text-lg tracking-tight">{APP_NAME}</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 pb-10">
          <div className="max-w-md w-full mx-auto lg:mx-0">
            <StepChips />

            <h1 className="text-3xl font-bold text-white mb-1">Giriş yap</h1>
            <p className="text-gray-500 mb-8">Hesabına hoş geldin.</p>

            <GoogleButton onError={setError} />

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs text-gray-600">veya e-posta ile</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@gmail.com"
                  className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Şifre</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreni gir"
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all mt-2"
              >
                {loading ? "Giriş yapılıyor…" : "Giriş yap →"}
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">
                Parolanı mı unuttun?{" "}
                <Link href="/forgot-password" className="text-white hover:text-blue-400 transition-colors font-medium">
                  Parolanı sıfırla
                </Link>
              </p>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              Hesabın yok mu?{" "}
              <Link href="/register" className="text-gray-500 hover:text-gray-400 transition-colors">Ücretsiz kayıt ol</Link>
            </p>

            <p className="text-center text-xs text-gray-600 mt-3">
              <Link href="/gizlilik" className="text-gray-600 hover:text-gray-400 transition-colors">
                Gizlilik Politikası
              </Link>
            </p>
          </div>
        </div>
      </div>

      <RightPanel />
    </div>
  )
}

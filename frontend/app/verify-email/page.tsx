"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import AuthCard from "@/components/auth/AuthCard"

type Status = "loading" | "success" | "error" | "pending"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCard><div className="text-center py-6 text-gray-500 text-sm">Yükleniyor…</div></AuthCard>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, isLoading, refresh } = useAuth()
  const token = params.get("token")

  // Token varsa doğrulama akışı; yoksa "bekleniyor" (giriş yapmış ama doğrulamamış kullanıcı buraya yönlenir)
  const [status, setStatus] = useState<Status>(token ? "loading" : "pending")
  const [errorMessage, setErrorMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [isResent, setIsResent] = useState(false)

  // Token ile doğrulama
  useEffect(() => {
    if (!token) return
    api.post("/auth/verify-email", { token })
      .then(async () => {
        setStatus("success")
        await refresh()
      })
      .catch((err) => {
        setStatus("error")
        setErrorMessage(extractErrorMessage(err))
      })
  }, [token, refresh])

  // Token yok + zaten doğrulanmış → devam et
  useEffect(() => {
    if (!token && !isLoading && user?.is_email_verified) {
      router.replace("/onboarding")
    }
  }, [token, isLoading, user, router])

  async function handleResend() {
    if (!user?.email) return
    setErrorMessage("")
    setIsResent(false)
    setIsResending(true)
    try {
      await api.post("/auth/resend-verification", { email: user.email })
      setIsResent(true)
    } catch (err) {
      setErrorMessage(extractErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  if (status === "loading") {
    return (
      <AuthCard>
        <div className="text-center py-6">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">E-postan doğrulanıyor…</p>
        </div>
      </AuthCard>
    )
  }

  if (status === "success") {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">E-posta doğrulandı</h1>
          <p className="text-gray-500 text-sm mb-6">Artık devam edebilirsin.</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer"
          >
            Onboarding&apos;e geç →
          </button>
        </div>
      </AuthCard>
    )
  }

  if (status === "error") {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Doğrulama başarısız</h1>
          <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
          <Link
            href="/login"
            className="inline-block w-full text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </AuthCard>
    )
  }

  // status === "pending"
  if (isLoading) {
    return <AuthCard><div className="text-center py-6 text-gray-500 text-sm">Yükleniyor…</div></AuthCard>
  }

  // Giriş yapılmamış + token yok → buraya düşmemeli; login'e yönlendir
  if (!user) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-white mb-2">E-posta doğrulama</h1>
          <p className="text-gray-400 text-sm mb-6">Devam etmek için giriş yap.</p>
          <Link href="/login" className="inline-block w-full text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
            Giriş yap
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <div className="text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-white mb-2">E-postanı doğrula</h1>
        <p className="text-gray-400 text-sm mb-1">
          <span className="text-gray-300">{user.email}</span> adresine bir doğrulama linki gönderdik.
        </p>
        <p className="text-gray-500 text-sm mb-6">Gelen kutunu (ve spam'i) kontrol et, linke tıkla.</p>

        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isResending ? "Gönderiliyor…" : "Doğrulama linkini tekrar gönder"}
        </button>

        {isResent && <p className="text-green-400 text-xs mt-3">Gönderildi ✓ Gelen kutunu kontrol et.</p>}
        {errorMessage && <p className="text-red-400 text-xs mt-3">{errorMessage}</p>}

        <p className="text-gray-600 text-xs mt-6">
          Doğruladıktan sonra <Link href="/login" className="text-blue-400 hover:text-blue-300">giriş yap</Link>.
        </p>
      </div>
    </AuthCard>
  )
}

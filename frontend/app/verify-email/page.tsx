"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import AuthCard from "@/components/auth/AuthCard"

type Status = "loading" | "success" | "error"

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
  const { refresh } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const token = params.get("token")
    if (!token) {
      setStatus("error")
      setErrorMessage("Doğrulama linki eksik veya hatalı.")
      return
    }

    api.post("/auth/verify-email", { token })
      .then(async () => {
        setStatus("success")
        await refresh()
      })
      .catch((err) => {
        setStatus("error")
        setErrorMessage(extractErrorMessage(err))
      })
  }, [params, refresh])

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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            Onboarding'e geç →
          </button>
        </div>
      </AuthCard>
    )
  }

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

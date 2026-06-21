"use client"

import { useState } from "react"
import Link from "next/link"
import { api, extractErrorMessage } from "@/lib/api"
import AuthCard from "@/components/auth/AuthCard"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes("@")) return
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/forgot-password", { email })
      setSubmitted(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-2xl font-bold text-white mb-2">E-postanı kontrol et</h1>
          <p className="text-gray-400 text-sm mb-1">
            Eğer <span className="text-white">{email}</span> kayıtlıysa parola sıfırlama linki gönderildi.
          </p>
          <p className="text-gray-600 text-xs mt-4">Gelmediyse spam klasörüne bak.</p>
          <Link href="/login" className="block mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Giriş sayfasına dön
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-white mb-1">Parolanı sıfırla</h1>
      <p className="text-gray-500 text-sm mb-6">E-postanı gir, sana bir sıfırlama linki gönderelim.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@gmail.com"
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={!email.includes("@") || loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all"
        >
          {loading ? "Gönderiliyor…" : "Sıfırlama linki gönder"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-white hover:text-blue-400 transition-colors">
          ← Giriş sayfasına dön
        </Link>
      </p>
    </AuthCard>
  )
}

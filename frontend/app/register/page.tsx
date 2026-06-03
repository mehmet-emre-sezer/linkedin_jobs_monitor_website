"use client"

import { useState } from "react"
import Link from "next/link"
import { APP_NAME } from "@/constants/app"
import RightPanel from "@/components/auth/RightPanel"
import GoogleButton from "@/components/auth/GoogleButton"
import EyeIcon from "@/components/auth/EyeIcon"
import StepChips from "@/components/auth/StepChips"

const passwordCriteria = [
  { id: "length",  label: "En az 8 karakter",      test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "Büyük harf",             test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "Küçük harf",             test: (p: string) => /[a-z]/.test(p) },
  { id: "number",  label: "Rakam",                  test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "Özel karakter (!@#...)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
]


function EmailSent({ email }: { email: string }) {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div className="text-4xl mb-6">📬</div>
      <h2 className="text-2xl font-bold text-white mb-3">E-postanı kontrol et</h2>
      <p className="text-gray-400 leading-relaxed">
        <span className="text-white font-medium">{email}</span> adresine doğrulama bağlantısı gönderdik.
      </p>
      <p className="text-gray-600 text-sm mt-4">Gelmediyse spam klasörüne bak.</p>
    </div>
  )
}

export default function RegisterPage() {
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [confirm, setConfirm]         = useState("")
  const [pwTouched, setPwTouched]     = useState(false)
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  const allCriteriaMet  = passwordCriteria.every((c) => c.test(password))
  const passwordsMatch  = password === confirm && confirm.length > 0
  const isFormValid     = email.includes("@") && allCriteriaMet && passwordsMatch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setError("")
    setLoading(true)
    // TODO: bkz devlog — Register API entegrasyonu
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="bg-[#0f1117] grid grid-cols-1 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-6">
          <Link href="/" className="text-white font-bold text-lg tracking-tight">{APP_NAME}</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 pb-10">
          {submitted ? (
            <EmailSent email={email} />
          ) : (
            <div className="max-w-md w-full mx-auto lg:mx-0">
              <StepChips />

              <h1 className="text-3xl font-bold text-white mb-1">Hesap oluştur</h1>
              <p className="text-gray-500 mb-8">Ücretsiz başla, kart bilgisi yok.</p>

              <GoogleButton />

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
                      onFocus={() => setPwTouched(true)}
                      placeholder="En az 8 karakter"
                      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {pwTouched && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {passwordCriteria.map((c) => {
                        const isMet = c.test(password)
                        return (
                          <div key={c.id} className={`flex items-center gap-1.5 text-xs transition-colors ${isMet ? "text-green-400" : "text-gray-600"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isMet ? "bg-green-400" : "bg-gray-700"}`} />
                            {c.label}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Şifre tekrar</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Şifreni tekrar gir"
                      className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none transition-all ${
                        confirm.length > 0
                          ? passwordsMatch ? "border-green-500/50" : "border-red-500/40"
                          : "border-white/[0.09] focus:border-blue-500/60 focus:bg-blue-500/5"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {confirm.length > 0 && passwordsMatch && (
                        <svg viewBox="0 0 20 20" className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10l4 4 8-8" />
                        </svg>
                      )}
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-400 mt-2">Şifreler eşleşmiyor</p>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all mt-2"
                >
                  {loading ? "Hesap oluşturuluyor…" : "Hesap oluştur →"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-3">
                  Zaten hesabın var mı?{" "}
                  <Link href="/login" className="text-white hover:text-blue-400 transition-colors font-medium">
                    Giriş yap
                  </Link>
                </p>
              </form>

              <p className="text-center text-xs text-gray-600 mt-6">
                Devam ederek{" "}
                <a href="/terms" className="text-gray-500 hover:text-gray-400 transition-colors">Kullanım Koşulları</a>&apos;nı kabul etmiş olursun.
              </p>
            </div>
          )}
        </div>
      </div>

      <RightPanel />
    </div>
  )
}

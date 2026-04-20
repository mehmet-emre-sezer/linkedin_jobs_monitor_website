import { useState } from "react"
import { Link } from "react-router-dom"
import { APP_NAME } from "../constants/app"

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function RightPanel() {
  return (
    <div className="max-lg:hidden relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1635] via-[#0a1628] to-[#060c1a]" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
      <img src="/auth-illustration.svg" alt="" className="absolute inset-0 w-full h-full object-cover z-10 pl-16 opacity-95" />
      <div className="absolute inset-y-0 left-0 w-2/3 z-20" style={{background: "linear-gradient(to right, #0f1117 0%, #0f1117 8%, rgba(15,17,23,0.65) 28%, rgba(15,17,23,0.25) 50%, rgba(15,17,23,0.05) 70%, transparent 100%)"}} />
    </div>
  )
}

export default function Login() {
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  const formValid = email.includes("@") && password.length >= 1

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formValid) return
    setError("")
    setLoading(true)
    // TODO: gerçek API çağrısı
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f1117] grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
      {/* SOL — form */}
      <div className="flex flex-col h-full">
        <div className="flex items-center px-8 py-6">
          <Link to="/" className="text-white font-bold text-lg tracking-tight">{APP_NAME}</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 pb-10">
          <div className="max-w-md w-full mx-auto lg:mx-0">
            {/* Adım şeridi */}
            <div className="flex items-start gap-1.5 mb-8 flex-nowrap overflow-x-auto scrollbar-none">
              {[
                { num: "01", label: "CV yükle",          sub: "Sistem seni tanısın" },
                { num: "02", label: "Biz tarayalım",      sub: "Günde 3 kez LinkedIn" },
                { num: "03", label: "Telegram'a gelsin",  sub: "Puanlı ilanlar gelir" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className="rounded-lg px-2.5 py-1.5" style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.35)"}}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-blue-400 font-mono text-[10px] font-bold">{s.num}</span>
                      <span className="text-white text-xs font-medium">{s.label}</span>
                    </div>
                    <div className="text-gray-600 text-[10px]">{s.sub}</div>
                  </div>
                  {i < 2 && (
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-700 shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">Giriş yap</h1>
            <p className="text-gray-500 mb-8">Hesabına hoş geldin.</p>

            {/* Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 text-sm text-gray-300 transition-colors mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile devam et
            </button>

            <div className="flex items-center gap-3 mb-6">
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
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={!formValid || loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all mt-2"
              >
                {loading ? "Giriş yapılıyor…" : "Giriş yap →"}
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">
                Parolanı mı unuttun?{" "}
                <Link to="/reset-password" className="text-white hover:text-blue-400 transition-colors font-medium">
                  Parolanı sıfırla
                </Link>
              </p>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              Hesabın yok mu?{" "}
              <Link to="/register" className="text-gray-500 hover:text-gray-400 transition-colors">Ücretsiz kayıt ol</Link>
            </p>
          </div>
        </div>
      </div>

      {/* SAĞ — görsel */}
      <RightPanel />
    </div>
  )
}

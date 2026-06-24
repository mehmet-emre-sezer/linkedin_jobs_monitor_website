"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { ProfileResponse } from "@/lib/profile-types"

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-")
  return `${day}.${month}.${year}`
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isTelegramConnected, setIsTelegramConnected] = useState(false)

  useEffect(() => {
    api
      .get<ProfileResponse>("/profile/me")
      .then((res) => setIsTelegramConnected(Boolean(res.data.telegram_chat_id)))
      .catch(() => undefined)
  }, [])

  function handleDeleted() {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <DashboardNav />
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ayarlar</h1>
          <p className="text-gray-500 text-sm">Hesabını yönet.</p>
        </div>

        {user && (
          <AccountSection
            email={user.email}
            createdAt={user.created_at}
            isVerified={user.is_email_verified}
          />
        )}
        <TelegramSection isConnected={isTelegramConnected} />
        <DangerSection onDeleted={handleDeleted} />
      </main>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <h2 className="text-white text-sm font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <div className="text-xs text-gray-600 mb-0.5">{label}</div>
      <div className="text-gray-200 text-sm break-all">{value}</div>
    </div>
  )
}

// ── Hesap + email durumu ────────────────────────────────────────

function AccountSection({
  email,
  createdAt,
  isVerified,
}: {
  email: string
  createdAt: string
  isVerified: boolean
}) {
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")

  async function resend() {
    setError("")
    setIsSent(false)
    setIsSending(true)
    try {
      await api.post("/auth/resend-verification", { email })
      setIsSent(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card title="Hesap">
      <InfoRow label="E-posta" value={email} />
      <InfoRow label="Kayıt tarihi" value={formatDate(createdAt)} />
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="text-xs text-gray-600 mb-0.5">E-posta doğrulama</div>
          <div className={`text-sm ${isVerified ? "text-green-400" : "text-yellow-400"}`}>
            {isVerified ? "● Doğrulandı" : "● Doğrulanmadı"}
          </div>
        </div>
        {!isVerified && (
          <button
            onClick={resend}
            disabled={isSending}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSending ? "Gönderiliyor…" : "Doğrulama gönder"}
          </button>
        )}
      </div>
      {isSent && <p className="text-green-400 text-xs mt-3">Doğrulama e-postası gönderildi ✓</p>}
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </Card>
  )
}

// ── Telegram ────────────────────────────────────────────────────

function TelegramSection({ isConnected }: { isConnected: boolean }) {
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState("")

  async function handleLink() {
    setError("")
    setIsLinking(true)
    try {
      const { data } = await api.post<{ url: string }>("/profile/me/telegram-link")
      window.open(data.url, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Card title="Telegram">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isConnected ? "text-blue-400" : "text-gray-400"}`}>
          {isConnected ? "● Bağlı" : "● Bağlı değil"}
        </span>
        <button
          onClick={handleLink}
          disabled={isLinking}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLinking ? "Hazırlanıyor…" : isConnected ? "Yeniden bağla" : "Bağla"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </Card>
  )
}

// ── Tehlikeli bölge ─────────────────────────────────────────────

function DangerSection({ onDeleted }: { onDeleted: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setError("")
    setIsDeleting(true)
    try {
      await api.delete("/auth/me")
      onDeleted()
    } catch (err) {
      setError(extractErrorMessage(err))
      setIsDeleting(false)
    }
  }

  return (
    <section className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-6">
      <h2 className="text-red-400 text-sm font-semibold">Tehlikeli Bölge</h2>
      <p className="text-gray-500 text-xs mt-0.5 mb-4">
        Hesabını silersen tüm verin (profil, ilanlar, aramalar) kalıcı olarak silinir.
      </p>

      {!isConfirming ? (
        <button
          onClick={() => setIsConfirming(true)}
          className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors cursor-pointer"
        >
          Hesabı sil
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-red-300 text-sm">Emin misin? Bu işlem geri alınamaz.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? "Siliniyor…" : "Evet, hesabımı sil"}
            </button>
            <button
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-gray-300 hover:text-white text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </section>
  )
}

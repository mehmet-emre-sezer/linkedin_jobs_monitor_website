"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { api, extractErrorMessage } from "@/lib/api"
import {
  adaptUserDetail,
  type AdminUserDetailResponse,
  type UserDetailView,
} from "@/lib/admin-types"

function getInitial(name: string) {
  return name.charAt(0).toUpperCase()
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-")
  return `${day}.${month}.${year.slice(2)}`
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<UserDetailView | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<AdminUserDetailResponse>(`/admin/users/${id}`)
      .then((res) => setDetail(adaptUserDetail(res.data)))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [id])

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <Link
        href="/admin/users"
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
      >
        ← Kullanıcılar
      </Link>

      {isLoading && <p className="text-gray-500 text-sm">Yükleniyor…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {detail && (
        <>
          {/* Üst: avatar + isim + email + abonelik */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-2xl font-semibold flex items-center justify-center shrink-0">
              {getInitial(detail.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{detail.name}</h1>
              <p className="text-gray-500 text-sm truncate">{detail.email}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border ${
              detail.subscription === "paid"
                ? "bg-green-500/15 text-green-400 border-green-500/30"
                : "bg-gray-500/15 text-gray-400 border-gray-500/30"
            }`}>
              {detail.subscription === "paid" ? "Ücretli" : "Ücretsiz"}
            </span>
          </div>

          {/* 2 kolon: profil + telegram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profil */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
              <h2 className="text-white text-sm font-semibold mb-4">Profil</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Üniversite</div>
                  <div className="text-gray-300">{detail.university ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Mezuniyet</div>
                  <div className="text-gray-300">{detail.graduationYear ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Beceriler</div>
                  {detail.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {detail.skills.map((skill) => (
                        <span key={skill} className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs">—</div>
                  )}
                </div>
              </div>
            </div>

            {/* Telegram + Tarih */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
              <h2 className="text-white text-sm font-semibold mb-4">Bağlantı</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Telegram</div>
                  <div className={detail.isTelegramConnected ? "text-blue-400" : "text-red-400"}>
                    {detail.isTelegramConnected ? "● Bağlı" : "● Bağlı değil"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Chat ID</div>
                  <div className="text-gray-300 font-mono text-xs">{detail.chatId ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Kayıt tarihi</div>
                  <div className="text-gray-300 tabular-nums">{formatDate(detail.registeredAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Son giriş</div>
                  <div className="text-gray-300 tabular-nums">{formatDate(detail.lastSeenAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <h2 className="text-white text-sm font-semibold mb-4">İlan istatistikleri</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Toplam taranan</div>
                <div className="text-2xl font-bold text-white tabular-nums">{detail.totalJobsScanned}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Gönderilen</div>
                <div className="text-2xl font-bold text-blue-400 tabular-nums">{detail.totalJobsSent}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Ortalama skor</div>
                <div className="text-2xl font-bold text-green-400 tabular-nums">{detail.averageScore}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

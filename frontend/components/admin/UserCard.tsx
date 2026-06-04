import Link from "next/link"
import type { User } from "@/constants/mockData"

interface Props {
  user: User
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase()
}

function formatDate(date: string) {
  // "2026-06-04" -> "04.06.26"
  const [year, month, day] = date.split("-")
  return `${day}.${month}.${year.slice(2)}`
}

export default function UserCard({ user }: Props) {
  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="block bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all"
    >
      {/* Üst: Avatar + isim + email */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-base font-semibold flex items-center justify-center shrink-0">
          {getInitial(user.name)}
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-medium truncate">{user.name}</div>
          <div className="text-gray-500 text-xs truncate">{user.email}</div>
        </div>
      </div>

      {/* Alt: rozet satırı */}
      <div className="flex flex-wrap gap-2 mb-3">
        {user.subscription === "paid" ? (
          <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
            ücretli
          </span>
        ) : (
          <span className="text-[10px] bg-gray-500/15 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full">
            ücretsiz
          </span>
        )}

        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
          user.isTelegramConnected
            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
            : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          <span>●</span>
          telegram
        </span>
      </div>

      {/* Tarihler */}
      <div className="text-xs text-gray-600 space-y-0.5">
        <div className="flex justify-between">
          <span>Kayıt:</span>
          <span className="text-gray-400 tabular-nums">{formatDate(user.registeredAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Son giriş:</span>
          <span className="text-gray-400 tabular-nums">{formatDate(user.lastSeenAt)}</span>
        </div>
      </div>
    </Link>
  )
}

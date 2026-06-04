"use client"

import { useState, useMemo } from "react"
import type { User, SubscriptionStatus } from "@/constants/mockData"
import UserCard from "./UserCard"
import FilterGroup from "./FilterGroup"

interface Props {
  users: User[]
}

type SubscriptionFilter = "all" | SubscriptionStatus
type TelegramFilter     = "all" | "connected" | "disconnected"

const subscriptionOptions: { value: SubscriptionFilter; label: string }[] = [
  { value: "all",  label: "Tümü"     },
  { value: "paid", label: "Ücretli"  },
  { value: "free", label: "Ücretsiz" },
]

const telegramOptions: { value: TelegramFilter; label: string }[] = [
  { value: "all",          label: "Tümü"        },
  { value: "connected",    label: "Bağlı"        },
  { value: "disconnected", label: "Bağlı değil" },
]

function matchesSearch(user: User, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
}

function matchesSubscription(user: User, filter: SubscriptionFilter) {
  if (filter === "all") return true
  return user.subscription === filter
}

function matchesTelegram(user: User, filter: TelegramFilter) {
  if (filter === "all") return true
  if (filter === "connected")    return user.isTelegramConnected
  if (filter === "disconnected") return !user.isTelegramConnected
  return true
}

export default function UsersFilterableList({ users }: Props) {
  const [searchQuery, setSearchQuery]       = useState("")
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("all")
  const [telegramFilter, setTelegramFilter] = useState<TelegramFilter>("all")

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      matchesSearch(u, searchQuery) &&
      matchesSubscription(u, subscriptionFilter) &&
      matchesTelegram(u, telegramFilter)
    )
  }, [users, searchQuery, subscriptionFilter, telegramFilter])

  return (
    <div className="space-y-4">
      {/* Arama + filtreler */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        {/* Arama */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İsim veya email ile ara…"
          className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 transition-colors"
        />

        {/* Filtre satırı */}
        <div className="flex flex-wrap gap-4">
          <FilterGroup
            label="Abonelik"
            options={subscriptionOptions}
            value={subscriptionFilter}
            onChange={setSubscriptionFilter}
          />
          <FilterGroup
            label="Telegram"
            options={telegramOptions}
            value={telegramFilter}
            onChange={setTelegramFilter}
          />
        </div>
      </div>

      {/* Sonuç sayısı */}
      <div className="text-xs text-gray-600">
        {filteredUsers.length} kullanıcı bulundu
      </div>

      {/* Liste */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-white text-sm font-medium mb-1">Sonuç bulunamadı</div>
          <div className="text-gray-500 text-xs">Filtreleri değiştirmeyi dene.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}


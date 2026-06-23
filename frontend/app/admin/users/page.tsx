"use client"

import { useEffect, useState } from "react"
import UsersFilterableList from "@/components/admin/UsersFilterableList"
import { api, extractErrorMessage } from "@/lib/api"
import { adaptUser, type AdminUserItemResponse } from "@/lib/admin-types"
import type { User } from "@/constants/mockData"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<AdminUserItemResponse[]>("/admin/users")
      .then((res) => setUsers(res.data.map(adaptUser)))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Kullanıcılar</h1>
        <p className="text-gray-500 text-sm">
          {isLoading ? "Yükleniyor…" : `Toplam ${users.length} kullanıcı.`}
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!isLoading && !error && <UsersFilterableList users={users} />}
    </div>
  )
}

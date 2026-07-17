"use client"

import { useEffect, useState } from "react"
import { api, extractErrorMessage } from "@/lib/api"
import { adaptUser, type AdminUserItemResponse } from "@/lib/admin-types"
import type { User } from "@/constants/mockData"

/**
 * Admin manuel tarama testi: dropdown'dan kullanıcı seç → Test et → tarama kuyruğa atılır.
 * (Beat'i beklemeden; POST /admin/scan/:id)
 */
export default function ScanTrigger() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get<AdminUserItemResponse[]>("/admin/users")
      .then((res) => {
        const list = res.data.map(adaptUser)
        setUsers(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch((err) => setError(extractErrorMessage(err)))
  }, [])

  async function handleTrigger() {
    if (!selectedId) return
    setError("")
    setResult("")
    setIsRunning(true)
    try {
      const { data } = await api.post<{ task_id: string }>(`/admin/scan/${selectedId}`)
      setResult(`Tarama kuyruğa atıldı (task ${data.task_id.slice(0, 8)}…). Worker loglarını izle.`)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <h2 className="text-white text-sm font-semibold mb-1">Manuel Tarama Testi</h2>
      <p className="text-gray-500 text-xs mb-4">
        Bir kullanıcı seç ve taramayı hemen tetikle (Beat&apos;i beklemeden).
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 cursor-pointer"
        >
          {users.length === 0 ? (
            <option value="">Kullanıcı yok</option>
          ) : (
            users.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#181a22]">
                {u.name} — {u.email} (#{u.id})
              </option>
            ))
          )}
        </select>

        <button
          onClick={handleTrigger}
          disabled={isRunning || !selectedId}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          {isRunning ? "Tetikleniyor…" : "Test et"}
        </button>
      </div>

      {result && <p className="text-green-400 text-xs mt-3">{result}</p>}
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </section>
  )
}

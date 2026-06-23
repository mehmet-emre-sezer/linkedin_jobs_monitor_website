"use client"

import { useEffect, useState } from "react"
import ErrorsFilterableList from "@/components/admin/ErrorsFilterableList"
import { api, extractErrorMessage } from "@/lib/api"
import { adaptErrorLog, type AdminErrorLogResponse } from "@/lib/admin-types"
import type { ErrorLog } from "@/constants/mockData"

export default function AdminErrorsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<AdminErrorLogResponse[]>("/admin/errors")
      .then((res) => setLogs(res.data.map(adaptErrorLog)))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Hata Logları</h1>
        <p className="text-gray-500 text-sm">Detay için satıra tıkla.</p>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Yükleniyor…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!isLoading && !error && <ErrorsFilterableList logs={logs} />}
    </div>
  )
}

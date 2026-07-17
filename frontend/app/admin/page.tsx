"use client"

import { useEffect, useState } from "react"
import AdminStatCards from "@/components/admin/AdminStatCards"
import FunnelChart from "@/components/admin/FunnelChart"
import ScanTrigger from "@/components/admin/ScanTrigger"
import { api, extractErrorMessage } from "@/lib/api"
import {
  adaptFunnel,
  adaptOverview,
  type AdminOverviewResponse,
  type FunnelStepResponse,
} from "@/lib/admin-types"
import type { AdminOverview, FunnelStep } from "@/constants/mockData"

export default function AdminHomePage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<AdminOverviewResponse>("/admin/overview"),
      api.get<FunnelStepResponse[]>("/admin/funnel"),
    ])
      .then(([overviewRes, funnelRes]) => {
        setOverview(adaptOverview(overviewRes.data))
        setFunnel(adaptFunnel(funnelRes.data))
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Genel Bakış</h1>
        <p className="text-gray-500 text-sm">Sistemin son 24 saat ve toplam durumu.</p>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Yükleniyor…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {overview && (
        <>
          <AdminStatCards
            totalUsers={overview.totalUsers}
            activeUsers={overview.activeUsers}
            registeredToday={overview.registeredToday}
            errorsLast24h={overview.errorsLast24h}
          />
          <FunnelChart steps={funnel} />
        </>
      )}

      <ScanTrigger />
    </div>
  )
}

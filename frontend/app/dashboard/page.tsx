"use client"

import { useEffect, useState } from "react"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type {
  BackendDashboardSummary,
  BackendJobItem,
  BackendQueryStat,
} from "@/lib/dashboard-types"
import type { Job, QueryStat } from "@/constants/mockData"
import DashboardNav from "@/components/dashboard/DashboardNav"
import StatusBanner from "@/components/dashboard/StatusBanner"
import StatCards from "@/components/dashboard/StatCards"
import RecentJobs from "@/components/dashboard/RecentJobs"
import QueryStats from "@/components/dashboard/QueryStats"
import RequireAuth from "@/components/auth/RequireAuth"

// ── Backend snake_case → component camelCase ────────────────────

function adaptJob(b: BackendJobItem): Job {
  return {
    id: String(b.id),
    title: b.title,
    company: b.company,
    location: b.location,
    score: b.score,
    postedAt: b.posted_at ?? "",
    applicants: b.applicants ?? 0,
    description: b.summary ?? "",
    matchedKeywords: b.matched_keywords,
    url: b.url,
  }
}

function adaptQueryStat(b: BackendQueryStat): QueryStat {
  return {
    query: b.query,
    jobCount: b.job_count,
    averageScore: b.average_score,
  }
}

// ── Sayfa ───────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardPageContent />
    </RequireAuth>
  )
}

function DashboardPageContent() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<BackendDashboardSummary | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [queryStats, setQueryStats] = useState<QueryStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    Promise.all([
      api.get<BackendDashboardSummary>("/dashboard/summary"),
      api.get<BackendJobItem[]>("/dashboard/jobs"),
      api.get<BackendQueryStat[]>("/dashboard/query-stats"),
    ])
      .then(([s, j, q]) => {
        setSummary(s.data)
        setJobs(j.data.map(adaptJob))
        setQueryStats(q.data.map(adaptQueryStat))
      })
      .catch((err) => setErrorMessage(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  const greetingName = user?.email?.split("@")[0] ?? ""

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <DashboardNav />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (errorMessage || !summary) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <DashboardNav />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 text-sm text-red-400">
            {errorMessage || "Dashboard verisi alınamadı."}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Selamlama */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Selam {greetingName} 👋
          </h1>
          <p className="text-gray-500 text-sm">Bugün sana iletilen ilanları gör.</p>
        </div>

        {/* Sistem durumu */}
        <StatusBanner
          nextScanAt={summary.next_scan_at}
          isTelegramConnected={summary.is_telegram_connected}
        />

        {/* Metrik kartlar */}
        <StatCards
          scanned={summary.scanned_this_week}
          sent={summary.sent_this_week}
          averageScore={summary.average_score}
          maxScore={summary.max_score}
        />

        {/* Liste + Sorgu performansı */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentJobs jobs={jobs} />
          </div>
          <div>
            <QueryStats stats={queryStats} />
          </div>
        </div>
      </main>
    </div>
  )
}

import DashboardNav from "@/components/dashboard/DashboardNav"
import StatusBanner from "@/components/dashboard/StatusBanner"
import StatCards from "@/components/dashboard/StatCards"
import RecentJobs from "@/components/dashboard/RecentJobs"
import QueryStats from "@/components/dashboard/QueryStats"
import {
  EMPTY_SUMMARY, MOCK_SUMMARY,
  EMPTY_JOBS, MOCK_JOBS,
  EMPTY_QUERY_STATS, MOCK_QUERY_STATS,
} from "@/constants/mockData"

// Geliştirme sırasında dolu veriyi görmek için true yap.
// Backend bağlanınca bu satır tamamen kalkacak.
const USE_MOCK_DATA = true

export default function DashboardPage() {
  const summary     = USE_MOCK_DATA ? MOCK_SUMMARY     : EMPTY_SUMMARY
  const jobs        = USE_MOCK_DATA ? MOCK_JOBS        : EMPTY_JOBS
  const queryStats  = USE_MOCK_DATA ? MOCK_QUERY_STATS : EMPTY_QUERY_STATS

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Selamlama */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Selam Emre 👋</h1>
          <p className="text-gray-500 text-sm">Bugün sana iletilen ilanları gör.</p>
        </div>

        {/* Sistem durumu */}
        <StatusBanner
          nextScanAt={summary.nextScanAt}
          isTelegramConnected={summary.isTelegramConnected}
        />

        {/* Metrik kartlar */}
        <StatCards
          scanned={summary.scannedThisWeek}
          sent={summary.sentThisWeek}
          averageScore={summary.averageScore}
          maxScore={summary.maxScore}
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

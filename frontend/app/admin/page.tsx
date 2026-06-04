import AdminStatCards from "@/components/admin/AdminStatCards"
import FunnelChart from "@/components/admin/FunnelChart"
import { MOCK_ADMIN_OVERVIEW, MOCK_FUNNEL } from "@/constants/mockData"

export default function AdminHomePage() {
  const overview = MOCK_ADMIN_OVERVIEW
  const funnel   = MOCK_FUNNEL

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Genel Bakış</h1>
        <p className="text-gray-500 text-sm">Sistemin son 24 saat ve toplam durumu.</p>
      </div>

      <AdminStatCards
        totalUsers={overview.totalUsers}
        activeUsers={overview.activeUsers}
        registeredToday={overview.registeredToday}
        errorsLast24h={overview.errorsLast24h}
      />

      <FunnelChart steps={funnel} />
    </div>
  )
}

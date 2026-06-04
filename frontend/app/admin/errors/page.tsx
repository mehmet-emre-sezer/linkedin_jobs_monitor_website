import ErrorsFilterableList from "@/components/admin/ErrorsFilterableList"
import { MOCK_ERROR_LOGS } from "@/constants/mockData"

export default function AdminErrorsPage() {
  const logs = MOCK_ERROR_LOGS

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Hata Logları</h1>
        <p className="text-gray-500 text-sm">Detay için satıra tıkla.</p>
      </div>

      <ErrorsFilterableList logs={logs} />
    </div>
  )
}

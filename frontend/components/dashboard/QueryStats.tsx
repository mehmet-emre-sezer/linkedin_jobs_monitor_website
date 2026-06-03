import type { QueryStat } from "@/constants/mockData"

interface Props {
  stats: QueryStat[]
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="text-3xl mb-2">📊</div>
      <div className="text-white text-sm font-medium mb-1">Henüz veri yok</div>
      <div className="text-gray-500 text-xs">Birkaç tarama sonrası burada görürsün.</div>
    </div>
  )
}

function StatRow({ stat }: { stat: QueryStat }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-white truncate">{stat.query}</div>
        <div className="text-xs text-gray-400 shrink-0 tabular-nums">
          {stat.averageScore}/100
        </div>
      </div>

      {/* Skor barı */}
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${stat.averageScore}%` }}
        />
      </div>

      <div className="text-[11px] text-gray-600">{stat.jobCount} ilan bulundu</div>
    </div>
  )
}

export default function QueryStats({ stats }: Props) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-white font-semibold">Sorgu performansı</h2>
        <div className="text-xs text-gray-600 mt-0.5">Son 30 gün</div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        {stats.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {stats.map((stat) => (
              <StatRow key={stat.query} stat={stat} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

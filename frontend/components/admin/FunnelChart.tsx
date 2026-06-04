import type { FunnelStep } from "@/constants/mockData"

interface Props {
  steps: FunnelStep[]
}

function calcPercentage(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

function calcDropoff(currentCount: number, previousCount: number) {
  if (previousCount === 0) return 0
  return Math.round(((previousCount - currentCount) / previousCount) * 100)
}

export default function FunnelChart({ steps }: Props) {
  if (steps.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
        <div className="text-gray-500 text-sm">Henüz veri yok.</div>
      </div>
    )
  }

  const startCount = steps[0].userCount

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-white font-semibold mb-1">Kullanıcı Yolculuğu</h2>
        <p className="text-gray-500 text-xs">Onboarding adımlarında kayıp oranı</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const percentage = calcPercentage(step.userCount, startCount)
          const dropoff = index > 0
            ? calcDropoff(step.userCount, steps[index - 1].userCount)
            : null

          return (
            <div key={step.label}>
              {/* Üst satır: etiket + sayı + yüzde */}
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white">{step.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {dropoff !== null && dropoff > 0 && (
                    <span className="text-xs text-red-400">↓ {dropoff}%</span>
                  )}
                  <span className="text-gray-400 tabular-nums">
                    {step.userCount}
                  </span>
                  <span className="text-xs text-gray-600 tabular-nums w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

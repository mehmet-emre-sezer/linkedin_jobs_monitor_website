import type { Job } from "@/constants/mockData"

interface Props {
  job: Job
}

function scoreColor(score: number) {
  if (score >= 85) return "bg-green-500/15 text-green-300 border-green-500/30"
  if (score >= 70) return "bg-blue-500/15 text-blue-300 border-blue-500/30"
  return "bg-gray-500/15 text-gray-400 border-gray-500/30"
}

function formatDate(date: string) {
  // "2026-06-03" -> "03.06.26"
  const [y, m, d] = date.split("-")
  return `${d}.${m}.${y.slice(2)}`
}

export default function JobCard({ job }: Props) {
  return (
    <a
      href={job.url}
      target="_blank"
      rel="noreferrer"
      className="block bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Skor badge */}
        <div className={`shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center font-bold tabular-nums ${scoreColor(job.score)}`}>
          {job.score}
        </div>

        {/* İlan içeriği */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">{job.title}</div>
          <div className="text-gray-500 text-xs mt-0.5 truncate">
            {job.company} · {job.location}
          </div>

          {/* Anahtar kelimeler */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.matchedKeywords.map((kw) => (
              <span key={kw} className="text-[10px] bg-white/[0.04] text-gray-400 border border-white/[0.06] px-2 py-0.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Tarih */}
        <div className="text-xs text-gray-600 shrink-0 tabular-nums">
          {formatDate(job.postedAt)}
        </div>
      </div>
    </a>
  )
}

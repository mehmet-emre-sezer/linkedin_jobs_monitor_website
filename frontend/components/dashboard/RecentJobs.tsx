import type { Job } from "@/constants/mockData"
import JobCard from "./JobCard"

interface Props {
  jobs: Job[]
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">📭</div>
      <div className="text-white font-medium mb-1">Henüz ilan gelmedi</div>
      <div className="text-gray-500 text-sm">Bir sonraki taramada burada görürsün.</div>
    </div>
  )
}

export default function RecentJobs({ jobs }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Son ilanlar</h2>
        <span className="text-xs text-gray-600">Son {jobs.length} ilan</span>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3">
        {jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

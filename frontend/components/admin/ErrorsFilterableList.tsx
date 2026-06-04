"use client"

import { useState, useMemo } from "react"
import type { ErrorLog, ErrorSeverity, ErrorSource } from "@/constants/mockData"
import ErrorLogRow from "./ErrorLogRow"
import FilterGroup from "./FilterGroup"

interface Props {
  logs: ErrorLog[]
}

type SeverityFilter = "all" | ErrorSeverity
type SourceFilter   = "all" | ErrorSource

const severityOptions: { value: SeverityFilter; label: string }[] = [
  { value: "all",     label: "Tümü"     },
  { value: "error",   label: "Error"    },
  { value: "warning", label: "Warning"  },
  { value: "info",    label: "Info"     },
]

const sourceOptions: { value: SourceFilter; label: string }[] = [
  { value: "all",      label: "Tümü"     },
  { value: "scraper",  label: "Scraper"  },
  { value: "scorer",   label: "Scorer"   },
  { value: "telegram", label: "Telegram" },
  { value: "database", label: "Database" },
  { value: "auth",     label: "Auth"     },
]

function matchesSearch(log: ErrorLog, query: string) {
  if (!query) return true
  return log.message.toLowerCase().includes(query.toLowerCase())
}

function matchesSeverity(log: ErrorLog, filter: SeverityFilter) {
  if (filter === "all") return true
  return log.severity === filter
}

function matchesSource(log: ErrorLog, filter: SourceFilter) {
  if (filter === "all") return true
  return log.source === filter
}

export default function ErrorsFilterableList({ logs }: Props) {
  const [searchQuery, setSearchQuery]         = useState("")
  const [severityFilter, setSeverityFilter]   = useState<SeverityFilter>("all")
  const [sourceFilter, setSourceFilter]       = useState<SourceFilter>("all")

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      matchesSearch(log, searchQuery) &&
      matchesSeverity(log, severityFilter) &&
      matchesSource(log, sourceFilter)
    )
  }, [logs, searchQuery, severityFilter, sourceFilter])

  return (
    <div className="space-y-4">
      {/* Filtre paneli */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hata mesajında ara…"
          className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 transition-colors"
        />

        <div className="flex flex-wrap gap-4">
          <FilterGroup label="Seviye" options={severityOptions} value={severityFilter} onChange={setSeverityFilter} />
          <FilterGroup label="Kaynak" options={sourceOptions}   value={sourceFilter}   onChange={setSourceFilter}   />
        </div>
      </div>

      <div className="text-xs text-gray-600">
        {filteredLogs.length} kayıt
      </div>

      {filteredLogs.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-white text-sm font-medium mb-1">Eşleşen kayıt yok</div>
          <div className="text-gray-500 text-xs">Filtreleri değiştirmeyi dene.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <ErrorLogRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import type { ErrorLog } from "@/constants/mockData"

interface Props {
  log: ErrorLog
}

function severityStyle(severity: ErrorLog["severity"]) {
  if (severity === "error")   return "bg-red-500/15 text-red-400 border-red-500/30"
  if (severity === "warning") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
  return "bg-blue-500/15 text-blue-400 border-blue-500/30"
}

export default function ErrorLogRow({ log }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Üst satır — tıklanabilir */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Severity badge */}
        <span className={`text-[10px] uppercase font-bold border px-2 py-0.5 rounded shrink-0 ${severityStyle(log.severity)}`}>
          {log.severity}
        </span>

        {/* Source badge */}
        <span className="text-[10px] bg-white/[0.04] text-gray-400 border border-white/[0.08] px-2 py-0.5 rounded shrink-0">
          {log.source}
        </span>

        {/* Mesaj */}
        <span className="flex-1 min-w-0 text-sm text-white truncate">
          {log.message}
        </span>

        {/* Tarih */}
        <span className="text-xs text-gray-600 tabular-nums shrink-0 hidden sm:inline">
          {log.timestamp}
        </span>

        {/* Açma oku */}
        <span className={`text-gray-500 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {/* Detay (açıkken) */}
      {isOpen && (
        <div className="border-t border-white/[0.06] px-4 py-3 space-y-3 bg-black/20">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-600 mb-0.5">Zaman</div>
              <div className="text-gray-300 font-mono tabular-nums">{log.timestamp}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-0.5">Kullanıcı</div>
              <div className="text-gray-300 font-mono">{log.userId ?? "sistemsel"}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 mb-1">Stack trace</div>
            <pre className="text-[11px] font-mono text-gray-400 bg-black/40 border border-white/[0.05] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {log.stackTrace}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

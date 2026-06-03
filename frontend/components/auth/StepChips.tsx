const chips = [
  { num: "01", label: "CV yükle",          sub: "Sistem seni tanısın" },
  { num: "02", label: "Biz tarayalım",     sub: "Günde 3 kez LinkedIn" },
  { num: "03", label: "Telegram'a gelsin", sub: "Puanlı ilanlar gelir" },
]

export default function StepChips() {
  return (
    <div className="flex items-start gap-1.5 mb-8 flex-nowrap overflow-x-auto">
      {chips.map((chip, i) => (
        <div key={chip.num} className="flex items-center gap-2">
          <div
            className="rounded-lg px-2.5 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.35)" }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-blue-400 font-mono text-[10px] font-bold">{chip.num}</span>
              <span className="text-white text-xs font-medium">{chip.label}</span>
            </div>
            <div className="text-gray-600 text-[10px]">{chip.sub}</div>
          </div>
          {i < chips.length - 1 && (
            <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-700 shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

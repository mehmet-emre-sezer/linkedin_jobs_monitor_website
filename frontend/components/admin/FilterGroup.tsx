"use client"

interface Props<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

export default function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{label}:</span>
      <div className="flex gap-1 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              value === opt.value
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-white/[0.04] text-gray-400 border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

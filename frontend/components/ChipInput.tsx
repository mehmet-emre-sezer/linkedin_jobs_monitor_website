"use client"

import { useRef, useState } from "react"

/** Enter ile ekleyip Backspace ile silinen etiket girişi (beceriler, roller, şehirler). */
export default function ChipInput({
  items,
  onChange,
  placeholder,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function add(raw: string) {
    const trimmed = raw.trim()
    if (trimmed && !items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...items, trimmed])
    }
    setInput("")
  }

  function remove(item: string) {
    onChange(items.filter((i) => i !== item))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      add(input)
    }
    if (e.key === "Backspace" && input === "" && items.length > 0) {
      remove(items[items.length - 1])
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 cursor-text"
    >
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full"
        >
          {item}
          <button
            type="button"
            onClick={() => remove(item)}
            aria-label={`${item} kaldır`}
            className="text-blue-400/60 hover:text-blue-200 transition-colors leading-none cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={items.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-white text-sm placeholder:text-gray-600 focus:outline-none py-1"
      />
    </div>
  )
}

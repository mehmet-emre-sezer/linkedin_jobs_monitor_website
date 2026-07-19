"use client"

import ChipInput from "@/components/ChipInput"

export const WORK_MODES = [
  { value: "any", label: "Farketmez" },
  { value: "remote", label: "Uzaktan" },
  { value: "hybrid", label: "Hibrit" },
  { value: "onsite", label: "Ofiste" },
]

export const LEVEL_PRESETS = [
  "Intern",
  "Entry Level",
  "Junior",
  "New Grad",
  "Mid-Level",
  "Senior",
]

export function toggleClass(active: boolean): string {
  return `px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
    active
      ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
      : "bg-white/[0.04] border-white/[0.1] text-gray-400 hover:text-white"
  }`
}

export interface SearchPreferences {
  locations: string[]
  workMode: string
  roles: string[]
  levels: string[]
}

/**
 * Arama tercihi alanları — kontrollü (controlled) bileşen.
 *
 * Hem onboarding adımı hem profil sayfası aynı alanları kullanıyor; kaydetme
 * davranışı (buton, API çağrısı) çağıran tarafa ait.
 */
export default function SearchPreferencesFields({
  value,
  onChange,
}: {
  value: SearchPreferences
  onChange: (next: SearchPreferences) => void
}) {
  function set<K extends keyof SearchPreferences>(key: K, val: SearchPreferences[K]) {
    onChange({ ...value, [key]: val })
  }

  function toggleLevel(level: string) {
    set(
      "levels",
      value.levels.includes(level)
        ? value.levels.filter((l) => l !== level)
        : [...value.levels, level],
    )
  }

  return (
    <div className="space-y-5">
      {/* Hedef roller — sorgular bunlardan kurulur, o yüzden en üstte ve zorunlu */}
      <div>
        <span className="block text-xs text-gray-500 mb-1.5">Hedef roller</span>
        <ChipInput
          items={value.roles}
          onChange={(roles) => set("roles", roles)}
          placeholder="Rol ekle (örn. Backend Developer)"
        />
        <p className="text-xs text-gray-600 mt-2">Enter ile ekle · Backspace ile sil</p>
      </div>

      {/* Seviye */}
      <div>
        <span className="block text-xs text-gray-500 mb-1.5">Seviye</span>
        <div className="flex flex-wrap gap-2">
          {LEVEL_PRESETS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleLevel(level)}
              className={toggleClass(value.levels.includes(level))}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Konum (çoklu şehir — her biri ayrı aranır) */}
      <div>
        <span className="block text-xs text-gray-500 mb-1.5">Konum</span>
        <ChipInput
          items={value.locations}
          onChange={(locations) => set("locations", locations)}
          placeholder="Şehir ekle (örn. İstanbul)"
        />
        <p className="text-xs text-gray-600 mt-2">Her şehir ayrı aranır · Enter ile ekle</p>
      </div>

      {/* Çalışma şekli */}
      <div>
        <span className="block text-xs text-gray-500 mb-1.5">Çalışma şekli</span>
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => set("workMode", mode.value)}
              className={toggleClass(value.workMode === mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

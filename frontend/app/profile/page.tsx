"use client"

import { useEffect, useRef, useState } from "react"
import DashboardNav from "@/components/dashboard/DashboardNav"
import CvUploadZone from "@/components/onboarding/CvUploadZone"
import { api, extractErrorMessage } from "@/lib/api"
import {
  GRADUATION_YEAR_MIN,
  GRADUATION_YEAR_MAX,
} from "@/constants/app"
import type { ProfileResponse } from "@/lib/profile-types"

// Bölümler arası ortak input stili (tema ile tutarlı, focus ring'li).
const INPUT_CLASS =
  "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm " +
  "placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"

const WORK_MODES = [
  { value: "any", label: "Farketmez" },
  { value: "remote", label: "Uzaktan" },
  { value: "hybrid", label: "Hibrit" },
  { value: "onsite", label: "Ofiste" },
]

const LEVEL_PRESETS = ["Intern", "Entry Level", "Junior", "New Grad", "Mid-Level", "Senior"]

const QUERY_MODES = [
  { value: "manual", label: "Manuel", desc: "Sadece girdiğin tercihlerden" },
  { value: "ai", label: "Yapay zeka", desc: "CV + becerilerinden (LLM)" },
  { value: "hybrid", label: "İkisi birden", desc: "Tercihler + yapay zeka" },
]

function toggleClass(active: boolean): string {
  return `px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
    active
      ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
      : "bg-white/[0.04] border-white/[0.1] text-gray-400 hover:text-white"
  }`
}

// Ortak chip input — beceriler ve hedef roller paylaşır (DRY).
function ChipInput({
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
        <span key={item} className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full">
          {item}
          <button type="button" onClick={() => remove(item)} aria-label={`${item} kaldır`} className="text-blue-400/60 hover:text-blue-200 transition-colors leading-none cursor-pointer">×</button>
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<ProfileResponse>("/profile/me")
      .then((res) => setProfile(res.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <DashboardNav />
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Profilim</h1>
          <p className="text-gray-500 text-sm">Bilgilerini güncelle. Her bölümü ayrı kaydedebilirsin.</p>
        </div>

        {isLoading && <p className="text-gray-500 text-sm">Yükleniyor…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {profile && (
          <>
            <BasicInfoSection profile={profile} onUpdated={setProfile} />
            <SkillsSection profile={profile} onUpdated={setProfile} />
            <SearchPreferencesSection profile={profile} onUpdated={setProfile} />
            <CvSection profile={profile} onUpdated={setProfile} />
            <TelegramSection profile={profile} />
          </>
        )}
      </main>
    </div>
  )
}

// ── Ortak bölüm iskeleti ────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <h2 className="text-white text-sm font-semibold">{title}</h2>
      {description && <p className="text-gray-500 text-xs mt-0.5 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  )
}

function SaveRow({
  isSaving,
  isSaved,
  isDisabled,
  error,
  label = "Kaydet",
}: {
  isSaving: boolean
  isSaved: boolean
  isDisabled?: boolean
  error?: string
  label?: string
}) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <button
        type="submit"
        disabled={isSaving || isDisabled}
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSaving ? "Kaydediliyor…" : label}
      </button>
      {isSaved && <span className="text-green-400 text-xs">Kaydedildi ✓</span>}
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}

// ── Temel bilgiler ──────────────────────────────────────────────

function BasicInfoSection({
  profile,
  onUpdated,
}: {
  profile: ProfileResponse
  onUpdated: (p: ProfileResponse) => void
}) {
  const [name, setName] = useState(profile.name ?? "")
  const [university, setUniversity] = useState(profile.university ?? "")
  const [gradYear, setGradYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : "",
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")

  const yearNum = Number(gradYear)
  const isValid =
    name.trim().length > 0 &&
    university.trim().length > 0 &&
    yearNum >= GRADUATION_YEAR_MIN &&
    yearNum <= GRADUATION_YEAR_MAX

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setError("")
    setIsSaved(false)
    setIsSaving(true)
    try {
      const { data } = await api.put<ProfileResponse>("/profile/me/basic", {
        name: name.trim(),
        university: university.trim(),
        graduation_year: yearNum,
      })
      onUpdated(data)
      setIsSaved(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard title="Temel Bilgiler">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs text-gray-500 mb-1.5">Ad Soyad</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Adın soyadın" />
        </div>
        <div>
          <label htmlFor="university" className="block text-xs text-gray-500 mb-1.5">Üniversite</label>
          <input id="university" value={university} onChange={(e) => setUniversity(e.target.value)} className={INPUT_CLASS} placeholder="Üniversiten" />
        </div>
        <div>
          <label htmlFor="gradYear" className="block text-xs text-gray-500 mb-1.5">Mezuniyet Yılı</label>
          <input
            id="gradYear"
            type="number"
            inputMode="numeric"
            min={GRADUATION_YEAR_MIN}
            max={GRADUATION_YEAR_MAX}
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            className={`${INPUT_CLASS} max-w-[140px] tabular-nums`}
            placeholder={String(GRADUATION_YEAR_MAX)}
          />
        </div>
        <SaveRow isSaving={isSaving} isSaved={isSaved} isDisabled={!isValid} error={error} />
      </form>
    </SectionCard>
  )
}

// ── Beceriler (chip input) ──────────────────────────────────────

function SkillsSection({
  profile,
  onUpdated,
}: {
  profile: ProfileResponse
  onUpdated: (p: ProfileResponse) => void
}) {
  const [skills, setSkills] = useState<string[]>(profile.skills ?? [])
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSaved(false)
    setIsSaving(true)
    try {
      const { data } = await api.put<ProfileResponse>("/profile/me/skills", { skills })
      onUpdated(data)
      setSkills(data.skills ?? [])
      setIsSaved(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard title="Beceriler" description="Aramalarında kullanılacak yeteneklerin.">
      <form onSubmit={handleSubmit}>
        <ChipInput items={skills} onChange={setSkills} placeholder="Beceri ekle ve Enter'a bas" />
        <p className="text-xs text-gray-600 mt-2">Enter ile ekle · Backspace ile sil</p>
        <SaveRow isSaving={isSaving} isSaved={isSaved} error={error} />
      </form>
    </SectionCard>
  )
}

// ── Arama tercihleri ────────────────────────────────────────────

function SearchPreferencesSection({
  profile,
  onUpdated,
}: {
  profile: ProfileResponse
  onUpdated: (p: ProfileResponse) => void
}) {
  const [location, setLocation] = useState(profile.search_location ?? "")
  const [workMode, setWorkMode] = useState(profile.work_mode || "any")
  const [roles, setRoles] = useState<string[]>(profile.target_roles ?? [])
  const [levels, setLevels] = useState<string[]>(profile.target_levels ?? [])
  const [queryMode, setQueryMode] = useState(profile.query_mode || "ai")
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")

  function toggleLevel(level: string) {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSaved(false)
    setIsSaving(true)
    try {
      const { data } = await api.put<ProfileResponse>("/profile/me/search-preferences", {
        search_location: location.trim() || null,
        work_mode: workMode,
        target_roles: roles,
        target_levels: levels,
        query_mode: queryMode,
      })
      onUpdated(data)
      setIsSaved(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard
      title="Arama Tercihleri"
      description="Nasıl iş aradığını belirt — bunlardan otomatik arama sorguları kurulur."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Konum */}
        <div>
          <label htmlFor="location" className="block text-xs text-gray-500 mb-1.5">Konum</label>
          <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={INPUT_CLASS} placeholder="İstanbul, Türkiye" />
        </div>

        {/* Çalışma şekli */}
        <div>
          <span className="block text-xs text-gray-500 mb-1.5">Çalışma şekli</span>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map((mode) => (
              <button key={mode.value} type="button" onClick={() => setWorkMode(mode.value)} className={toggleClass(workMode === mode.value)}>
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hedef roller */}
        <div>
          <span className="block text-xs text-gray-500 mb-1.5">Hedef roller</span>
          <ChipInput items={roles} onChange={setRoles} placeholder="Rol ekle (örn. Machine Learning Engineer)" />
          <p className="text-xs text-gray-600 mt-2">Enter ile ekle · Backspace ile sil</p>
        </div>

        {/* Seviye */}
        <div>
          <span className="block text-xs text-gray-500 mb-1.5">Seviye</span>
          <div className="flex flex-wrap gap-2">
            {LEVEL_PRESETS.map((level) => (
              <button key={level} type="button" onClick={() => toggleLevel(level)} className={toggleClass(levels.includes(level))}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Sorgu üretim modu */}
        <div>
          <span className="block text-xs text-gray-500 mb-2">Sorgu üretimi</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {QUERY_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setQueryMode(mode.value)}
                className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  queryMode === mode.value
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/[0.1] bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="text-sm text-white font-medium">{mode.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <SaveRow isSaving={isSaving} isSaved={isSaved} error={error} />
      </form>
    </SectionCard>
  )
}

// ── CV ──────────────────────────────────────────────────────────

function CvSection({
  profile,
  onUpdated,
}: {
  profile: ProfileResponse
  onUpdated: (p: ProfileResponse) => void
}) {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  async function handleFileSelected(file: File) {
    setError("")
    setIsSaved(false)
    setIsParsing(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const { data } = await api.post<ProfileResponse>("/profile/me/cv", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onUpdated(data)
      setIsSaved(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <SectionCard title="CV" description="PDF, DOC veya DOCX. Yeni yükleme eksik profil alanlarını doldurur.">
      {profile.cv_filename ? (
        <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 mb-4">
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{profile.cv_filename}</div>
            <div className="text-gray-600 text-xs">Yüklü</div>
          </div>
          <span className="text-green-400 text-xs shrink-0">● Mevcut</span>
        </div>
      ) : (
        <p className="text-gray-500 text-xs mb-4">Henüz CV yüklenmedi.</p>
      )}

      <CvUploadZone cvFile={null} isParsing={isParsing} onFileSelected={handleFileSelected} />

      <div className="flex items-center gap-3 mt-3">
        {isSaved && <span className="text-green-400 text-xs">CV güncellendi ✓</span>}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    </SectionCard>
  )
}

// ── Telegram ────────────────────────────────────────────────────

function TelegramSection({ profile }: { profile: ProfileResponse }) {
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState("")
  const isConnected = Boolean(profile.telegram_chat_id)

  async function handleLink() {
    setError("")
    setIsLinking(true)
    try {
      const { data } = await api.post<{ url: string }>("/profile/me/telegram-link")
      window.open(data.url, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <SectionCard title="Telegram" description="İlan bildirimleri Telegram'a gelir.">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isConnected ? "text-blue-400" : "text-gray-400"}`}>
          {isConnected ? "● Bağlı" : "● Bağlı değil"}
        </span>
        <button
          onClick={handleLink}
          disabled={isLinking}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLinking ? "Hazırlanıyor…" : isConnected ? "Yeniden bağla" : "Bağla"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </SectionCard>
  )
}

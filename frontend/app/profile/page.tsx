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
import RequireAuth from "@/components/auth/RequireAuth"
import ChipInput from "@/components/ChipInput"
import SearchPreferencesFields, { type SearchPreferences } from "@/components/SearchPreferencesFields"
import TelegramLinkPanel, { useIsMobile } from "@/components/TelegramLinkPanel"

// Bölümler arası ortak input stili (tema ile tutarlı, focus ring'li).
const INPUT_CLASS =
  "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm " +
  "placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfilePageContent />
    </RequireAuth>
  )
}

function ProfilePageContent() {
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
  const [prefs, setPrefs] = useState<SearchPreferences>({
    locations: profile.search_locations ?? [],
    workMode: profile.work_mode || "any",
    roles: profile.target_roles ?? [],
    levels: profile.target_levels ?? [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSaved(false)
    setIsSaving(true)
    try {
      const { data } = await api.put<ProfileResponse>("/profile/me/search-preferences", {
        search_locations: prefs.locations,
        work_mode: prefs.workMode,
        target_roles: prefs.roles,
        target_levels: prefs.levels,
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
      <form onSubmit={handleSubmit}>
        <SearchPreferencesFields value={prefs} onChange={setPrefs} />
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
  const [linkUrl, setLinkUrl] = useState("")
  const isMobile = useIsMobile()
  const isConnected = Boolean(profile.telegram_chat_id)

  // Mobilde Telegram kurulu olduğu için doğrudan açıyoruz. Masaüstünde
  // uygulama olmayabilir; orada QR + kopyalanabilir link gösteriyoruz.
  async function handleLink() {
    setError("")
    setIsLinking(true)
    try {
      const { data } = await api.post<{ url: string }>("/profile/me/telegram-link")
      if (isMobile) {
        window.location.href = data.url
      } else {
        setLinkUrl(data.url)
      }
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
      {linkUrl && <TelegramLinkPanel url={linkUrl} />}
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </SectionCard>
  )
}

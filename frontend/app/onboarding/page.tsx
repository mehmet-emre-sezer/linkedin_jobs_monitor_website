"use client"

"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { APP_NAME, BOT_URL, GRADUATION_YEAR_MIN, GRADUATION_YEAR_MAX, ONBOARDING_EXAMPLE_SKILLS } from "@/constants/app"
import CvUploadZone from "@/components/onboarding/CvUploadZone"
import CvParsePreview from "@/components/onboarding/CvParsePreview"

const TOTAL_STEPS = 4

// ── Tipler ──────────────────────────────────────────────────────

interface ProfileInfo {
  name: string
  university: string
  gradYear: string
}

interface ParsedCv {
  name: string
  university: string
  gradYear: string
  skills: string[]
}

// ── Mock CV parse verisi ─────────────────────────────────────────

const MOCK_CV_PARSE: ParsedCv = {
  name: "Mehmet Emre Sezer",
  university: "İstanbul Teknik Üniversitesi",
  gradYear: "2025",
  skills: ["Python", "Machine Learning", "SQL", "PyTorch", "scikit-learn", "Pandas"],
}

// ── Yardımcı bileşenler ──────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all shrink-0 ${
            i + 1 < step   ? "bg-blue-600 text-white" :
            i + 1 === step ? "bg-blue-600 text-white ring-4 ring-blue-500/20" :
                             "bg-white/[0.06] text-gray-600"
          }`}>
            {i + 1 < step ? (
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
            ) : i + 1}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div className={`h-px flex-1 transition-all ${i + 1 < step ? "bg-blue-600" : "bg-white/[0.08]"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function NavButtons({
  step, onBack, onNext, nextLabel = "Devam et →", isNextDisabled = false, isLoading = false,
}: {
  step: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
}) {
  return (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <button onClick={onBack} className="flex-1 border py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          ← Geri
        </button>
      )}
      <button onClick={onNext} disabled={isNextDisabled || isLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold transition-all">
        {isLoading ? "Yükleniyor…" : nextLabel}
      </button>
    </div>
  )
}

// ── ADIM 1: Temel bilgiler ───────────────────────────────────────

function Step1({ profileInfo, onChange }: { profileInfo: ProfileInfo; onChange: (key: keyof ProfileInfo, val: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Seni tanıyalım</h2>
      <p className="text-gray-500 text-sm mb-8">Birkaç temel bilgi, sistem seni daha iyi anlasın.</p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Ad Soyad</label>
          <input type="text" value={profileInfo.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Mehmet Emre Sezer"
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Üniversite</label>
          <input type="text" value={profileInfo.university} onChange={(e) => onChange("university", e.target.value)} placeholder="İstanbul Teknik Üniversitesi"
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Mezuniyet Yılı</label>
          <input type="number" value={profileInfo.gradYear} onChange={(e) => onChange("gradYear", e.target.value)}
            placeholder="2025" min={GRADUATION_YEAR_MIN} max={GRADUATION_YEAR_MAX}
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all" />
        </div>
      </div>
    </div>
  )
}

// ── ADIM 2: Beceriler ────────────────────────────────────────────

function Step2({ skills, setSkills }: { skills: string[]; setSkills: (skills: string[]) => void }) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addSkill(value: string) {
    const trimmed = value.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setInput("")
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); addSkill(input) }
    if (e.key === "Backspace" && input === "" && skills.length > 0) {
      removeSkill(skills[skills.length - 1])
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Becerilerini ekle</h2>
      <p className="text-gray-500 text-sm mb-8">Sistem bu becerilere göre sana uygun ilanları bulacak.</p>

      <div
        className="min-h-[120px] bg-white/[0.03] border border-white/[0.09] rounded-xl p-3 flex flex-wrap gap-2 cursor-text focus-within:border-blue-500/60 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {skills.map((skill) => (
          <span key={skill} className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400/60 hover:text-blue-200 transition-colors leading-none">×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "Beceri ekle ve Enter'a bas" : ""}
          className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1 min-w-[160px]"
        />
      </div>

      <p className="text-xs text-gray-600 mt-2">Enter ile ekle · Backspace ile sil</p>

      <div className="mt-5">
        <p className="text-xs text-gray-500 mb-2">Hızlı ekle:</p>
        <div className="flex flex-wrap gap-2">
          {ONBOARDING_EXAMPLE_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
            <button key={s} type="button" onClick={() => setSkills([...skills, s])}
              className="text-xs text-gray-400 hover:text-white border border-white/[0.12] hover:border-white/30 rounded-full px-3 py-1 transition-all">
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ADIM 3: CV yükleme ───────────────────────────────────────────

function Step3({ cvFile, setCvFile, onParsed }: { cvFile: File | null; setCvFile: (f: File | null) => void; onParsed: (data: ParsedCv) => void }) {
  const [isParsing, setIsParsing] = useState(false)
  const [parsed, setParsed]       = useState<ParsedCv | null>(null)

  async function handleFileSelected(file: File) {
    setCvFile(file)
    setIsParsing(true)
    // TODO: bkz devlog — CV parse API entegrasyonu
    await new Promise((r) => setTimeout(r, 1400))
    setParsed(MOCK_CV_PARSE)
    onParsed(MOCK_CV_PARSE)
    setIsParsing(false)
  }

  function handleReset() {
    setParsed(null)
    setCvFile(null)
  }

  if (parsed) {
    return <CvParsePreview parsed={parsed} onReset={handleReset} />
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">CV&apos;ni yükle</h2>
      <p className="text-gray-500 text-sm mb-8">Sistem CV&apos;nden profilini otomatik çıkaracak.</p>
      <CvUploadZone cvFile={cvFile} isParsing={isParsing} onFileSelected={handleFileSelected} />
    </div>
  )
}

// ── ADIM 4: Telegram ─────────────────────────────────────────────

function Step4() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Telegram&apos;a bağlan</h2>
      <p className="text-gray-500 text-sm mb-8">İlan bildirimleri Telegram üzerinden gelecek.</p>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg shrink-0">✈️</div>
          <div>
            <div className="text-white text-sm font-semibold">{APP_NAME} Bot</div>
            <div className="text-gray-500 text-xs">t.me/jobradar_bot</div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { num: "1", text: "Aşağıdaki butona tıkla, Telegram açılır." },
            { num: "2", text: "/start yaz ve gönder." },
            { num: "3", text: "Geri dön, kurulum tamamlandı." },
          ].map((item) => (
            <div key={item.num} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                {item.num}
              </div>
              <p className="text-gray-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
        <a href={BOT_URL} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
          Botu aç
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9" />
          </svg>
        </a>
      </div>
      <p className="text-center text-xs text-gray-600">
        Telegram&apos;ın yoksa{" "}
        <a href="https://telegram.org" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">telegram.org</a>&apos;dan indirebilirsin.
      </p>
    </div>
  )
}

// ── ANA SAYFA ────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({ name: "", university: "", gradYear: "" })
  const [skills, setSkills]           = useState<string[]>([])
  const [cvFile, setCvFile]           = useState<File | null>(null)

  function updateProfileInfo(key: keyof ProfileInfo, val: string) {
    setProfileInfo((prev) => ({ ...prev, [key]: val }))
  }

  function handleCvParsed(parsed: ParsedCv) {
    if (!profileInfo.name)       updateProfileInfo("name", parsed.name)
    if (!profileInfo.university) updateProfileInfo("university", parsed.university)
    if (!profileInfo.gradYear)   updateProfileInfo("gradYear", parsed.gradYear)
    const newSkills = parsed.skills.filter((s) => !skills.includes(s))
    if (newSkills.length) setSkills((prev) => [...prev, ...newSkills])
  }

  const stepValidators: Record<number, boolean> = {
    1: !!(profileInfo.name.trim() && profileInfo.university.trim() && profileInfo.gradYear),
    2: skills.length > 0,
    3: !!cvFile,
    4: true,
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <div className="flex items-center px-8 py-5 max-w-2xl mx-auto w-full">
        <span className="text-white font-bold text-lg tracking-tight">{APP_NAME}</span>
        <span className="ml-auto text-xs text-gray-600">{step} / {TOTAL_STEPS}</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-8">
            <ProgressBar step={step} />

            {step === 1 && <Step1 profileInfo={profileInfo} onChange={updateProfileInfo} />}
            {step === 2 && <Step2 skills={skills} setSkills={setSkills} />}
            {step === 3 && <Step3 cvFile={cvFile} setCvFile={setCvFile} onParsed={handleCvParsed} />}
            {step === 4 && <Step4 />}

            <NavButtons
              step={step}
              onBack={() => setStep((s) => s - 1)}
              onNext={handleNext}
              isNextDisabled={!stepValidators[step]}
              nextLabel={step === TOTAL_STEPS ? "Tamamla →" : "Devam et →"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

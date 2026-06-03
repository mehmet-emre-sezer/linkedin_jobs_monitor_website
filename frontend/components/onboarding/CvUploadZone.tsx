"use client"

import { useRef, useState } from "react"

interface Props {
  cvFile: File | null
  isParsing: boolean
  onFileSelected: (file: File) => void
}

export default function CvUploadZone({ cvFile, isParsing, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
        isDragging ? "border-blue-500/60 bg-blue-500/10" : "border-white/[0.1] hover:border-white/20 hover:bg-white/[0.02]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFileSelected(e.target.files[0]) }}
      />

      {isParsing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">CV analiz ediliyor…</p>
        </div>
      ) : cvFile ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl">📄</div>
          <p className="text-white text-sm font-medium">{cvFile.name}</p>
          <p className="text-gray-500 text-xs">Analiz bekleniyor</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl">
            📎
          </div>
          <div>
            <p className="text-white text-sm font-medium">Sürükle &amp; bırak veya seç</p>
            <p className="text-gray-600 text-xs mt-1">PDF, DOC, DOCX — maks. 10 MB</p>
          </div>
        </div>
      )}
    </div>
  )
}

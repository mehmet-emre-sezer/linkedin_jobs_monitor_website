interface ParsedCv {
  name: string
  university: string
  gradYear: string
  skills: string[]
}

interface Props {
  parsed: ParsedCv
  onReset: () => void
}

export default function CvParsePreview({ parsed, onReset }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">CV analiz edildi</h2>
      <p className="text-gray-500 text-sm mb-6">Şunları tespit ettik — devam etmeden önce kontrol et.</p>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-600 mb-1">Ad Soyad</div>
            <div className="text-white text-sm font-medium">{parsed.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Mezuniyet</div>
            <div className="text-white text-sm font-medium">{parsed.gradYear}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Üniversite</div>
          <div className="text-white text-sm font-medium">{parsed.university}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-2">Tespit edilen beceriler</div>
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.map((skill) => (
              <span key={skill} className="text-xs bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onReset} className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Farklı bir CV yükle
      </button>
    </div>
  )
}

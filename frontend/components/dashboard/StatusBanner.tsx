import Link from "next/link"

interface Props {
  nextScanAt: string
  isTelegramConnected: boolean
}

export default function StatusBanner({ nextScanAt, isTelegramConnected }: Props) {
  // Telegram bağlı değilse tarama hiç çalışmıyor (bkz. enqueue_all_user_scans).
  // Bu yüzden pasif bir "bağlı değil" rozeti yerine, sonucunu açıklayan ve
  // çözüme götüren bir uyarı gösteriyoruz — yoksa kullanıcı dashboard'ının
  // neden boş kaldığını anlamıyor.
  if (!isTelegramConnected) {
    return (
      <div className="bg-amber-500/[0.08] border border-amber-500/30 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚠️</span>
            <span className="text-amber-300 text-sm font-semibold">
              Taramalar henüz başlamadı
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            İlanları Telegram üzerinden ilettiğimiz için taramalar yalnızca bot
            bağlıyken çalışıyor. Bağladığında her akşam 20:30&apos;da sana uygun
            ilanlar aranmaya başlayacak.
          </p>
        </div>

        <Link
          href="/settings"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-sm font-medium transition-colors text-center"
        >
          Telegram&apos;ı bağla
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      {/* Sıradaki tarama */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">⏰</span>
        <span className="text-gray-400">Sıradaki tarama:</span>
        <span className="text-white font-medium">{nextScanAt}</span>
      </div>

      {/* Ayırıcı */}
      <div className="hidden sm:block w-px h-5 bg-white/[0.08]" />

      {/* Telegram durumu */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-400">●</span>
        <span className="text-gray-400">Telegram</span>
        <span className="text-green-400 font-medium">bağlı</span>
      </div>
    </div>
  )
}

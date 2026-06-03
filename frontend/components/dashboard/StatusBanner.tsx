interface Props {
  nextScanAt: string
  isTelegramConnected: boolean
}

export default function StatusBanner({ nextScanAt, isTelegramConnected }: Props) {
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
        {isTelegramConnected ? (
          <>
            <span className="text-green-400">●</span>
            <span className="text-gray-400">Telegram</span>
            <span className="text-green-400 font-medium">bağlı</span>
          </>
        ) : (
          <>
            <span className="text-red-400">●</span>
            <span className="text-gray-400">Telegram</span>
            <span className="text-red-400 font-medium">bağlı değil</span>
          </>
        )}
      </div>
    </div>
  )
}

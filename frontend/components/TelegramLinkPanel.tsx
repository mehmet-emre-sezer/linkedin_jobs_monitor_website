"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"

/**
 * Cihaz mobil mi?
 *
 * Masaüstünde Telegram uygulaması kurulu olmayabilir; o durumda t.me
 * sayfasındaki "START BOT" düğmesi `tg://` protokolünü açamayıp hata veriyor.
 * Bu yüzden masaüstünde QR gösterip kullanıcıyı telefonuna yönlendiriyoruz.
 *
 * SSR'de `navigator` yok — ilk render'da daima false, mount sonrası ölçülür.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(ua))
  }, [])

  return isMobile
}

/** Masaüstünde gösterilen bağlanma paneli: QR + kopyalanabilir link. */
export default function TelegramLinkPanel({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const [copyError, setCopyError] = useState("")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setCopyError("Kopyalanamadı — linki elle seçip kopyalayabilirsin.")
    }
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
      <p className="text-sm text-gray-300 mb-4">
        Telefonunun kamerasıyla QR kodu okut — Telegram açılıp hesabını bağlayacak.
      </p>

      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white rounded-xl">
          <QRCodeSVG value={url} size={160} level="M" />
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-2">Ya da linki kopyalayıp telefonuna gönder:</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.1] text-gray-300 text-xs font-mono"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors cursor-pointer"
        >
          {isCopied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-blue-400 text-xs underline"
      >
        Bu cihazda Telegram kuruluysa buradan aç →
      </a>

      {copyError && <p className="text-red-400 text-xs mt-2">{copyError}</p>}
      <p className="text-gray-500 text-xs mt-3">Link 30 dakika geçerli ve tek kullanımlık.</p>
    </div>
  )
}

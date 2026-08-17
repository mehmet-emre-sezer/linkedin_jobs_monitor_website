import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"
import { COMPANY as C, PLAN } from "@/constants/company"

export const metadata = {
  title: `Fiyatlandırma · ${C.brand}`,
  description: `${C.brand} aylık ${PLAN.priceTry} TL. ${PLAN.trialDays} gün ücretsiz dene.`,
}

const FEATURES = [
  "Her akşam otomatik LinkedIn taraması",
  "Yapay zekâ ile profiline göre ilan puanlama",
  "Yalnızca sana uyan ilanlar — spam yok",
  "Telegram'a anında bildirim",
  "Sınırsız arama tercihi ve şehir",
  "İstediğin zaman tek tıkla iptal",
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Ana sayfa
        </Link>

        <div className="text-center mt-8 mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Basit, tek plan</h1>
          <p className="text-gray-500 text-sm">
            {PLAN.trialDays} gün ücretsiz dene, beğenmezsen iptal et.
          </p>
        </div>

        {/* Plan kartı */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.08] to-transparent p-8">
          <div className="text-center mb-6">
            <div className="text-blue-300 text-sm font-medium mb-2">
              {C.brand} Aboneliği
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white">{PLAN.priceTry} TL</span>
              <span className="text-gray-500 text-sm">/ ay</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">KDV dahil · İlk {PLAN.trialDays} gün ücretsiz</p>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                <svg
                  viewBox="0 0 20 20"
                  className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10l4 4 8-8" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors"
          >
            {PLAN.trialDays} gün ücretsiz başla
          </Link>
          <p className="text-center text-gray-600 text-xs mt-3">
            Deneme süresi içinde iptal edersen ücret alınmaz.
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Ödemeler iyzico güvencesiyle alınır. Devam ederek{" "}
          <Link href="/mesafeli-satis" className="text-gray-500 hover:text-gray-400 underline">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link href="/gizlilik" className="text-gray-500 hover:text-gray-400 underline">
            Gizlilik Sözleşmesi
          </Link>
          &apos;ni kabul etmiş olursun.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}

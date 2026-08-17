import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

/** Yasal/içerik sayfaları için ortak kabuk (gizlilik, mesafeli satış, vb.). */
export default function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Ana sayfa
        </Link>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2">{title}</h1>
        {updatedAt && (
          <p className="text-gray-600 text-sm mb-12">Son güncelleme: {updatedAt}</p>
        )}
        {!updatedAt && <div className="mb-10" />}

        <div className="space-y-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-white text-lg font-semibold mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

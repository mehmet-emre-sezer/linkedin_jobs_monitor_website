import Link from "next/link"
import { APP_NAME } from "@/constants/app"
import { COMPANY } from "@/constants/company"

const LEGAL_LINKS = [
  { href: "/fiyatlandirma", label: "Fiyatlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/gizlilik", label: "Gizlilik Sözleşmesi" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/teslimat-iade", label: "Teslimat ve İade Şartları" },
]

/** Site geneli footer — yasal sayfa linkleri + ödeme logoları (iyzico onay şartı). */
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0b0d13]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Marka + satıcı (tam adres yalnızca sözleşme sayfalarında) */}
          <div className="max-w-xs">
            <div className="text-white font-bold mb-2">{APP_NAME}</div>
            <p className="text-gray-500 text-xs leading-relaxed">
              {COMPANY.legalName}
              <br />
              <a
                href={`mailto:${COMPANY.email}`}
                className="hover:text-gray-300 transition-colors"
              >
                {COMPANY.email}
              </a>
            </p>
          </div>

          {/* Yasal linkler */}
          <nav className="flex flex-col gap-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Ödeme logoları */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {COMPANY.legalName}. Tüm hakları saklıdır.
          </span>
          {/* iyzico resmi footer bandı: iyzico ile Öde + Visa/Mastercard/Amex/troy */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/iyzico-band-colored.svg"
            alt="iyzico ile Öde · Visa · Mastercard · American Express · troy"
            width={375}
            height={28}
            className="h-7 max-w-full w-auto"
          />
        </div>
      </div>
    </footer>
  )
}

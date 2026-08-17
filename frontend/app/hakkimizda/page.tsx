import LegalPage, { LegalSection } from "@/components/LegalPage"
import { COMPANY as C } from "@/constants/company"

export const metadata = {
  title: `Hakkımızda · ${C.brand}`,
  description: `${C.brand} nedir, ne işe yarar?`,
}

export default function AboutPage() {
  return (
    <LegalPage title="Hakkımızda">
      <LegalSection title={`${C.brand} nedir?`}>
        <p>
          {C.brand}, yeni mezun ve kariyerinin başındaki iş arayanlar için
          geliştirilen bir iş ilanı takip aracıdır. Amacımız, senin yerine her gün
          LinkedIn&apos;i tarayıp becerilerine ve tercihlerine en uygun ilanları
          bulmak ve doğrudan Telegram&apos;a getirmektir.
        </p>
      </LegalSection>

      <LegalSection title="Nasıl çalışır?">
        <p>
          Profilini ve arama tercihlerini bir kez tanımlarsın. Ardından her akşam
          LinkedIn&apos;de yeni açılan ilanları tarar, her birini profilinle
          karşılaştırıp puanlar ve yalnızca sana uygun olanları Telegram üzerinden
          iletiriz. Böylece onlarca ilanı tek tek elemek yerine, sadece işine
          yarayanlarla ilgilenirsin.
        </p>
      </LegalSection>

      <LegalSection title="İşletme bilgileri">
        <p>
          {C.brand}, <strong className="text-gray-300">{C.legalName}</strong>{" "}
          tarafından işletilmektedir.
        </p>
        <p>
          Vergi Dairesi / No: {C.taxOffice} · {C.taxNumber}
          <br />
          Telefon: {C.phone}
          <br />
          E-posta:{" "}
          <a href={`mailto:${C.email}`} className="text-blue-400 hover:text-blue-300">
            {C.email}
          </a>
        </p>
        <p className="text-gray-500 text-xs">
          Açık adres bilgisi{" "}
          <a href="/mesafeli-satis" className="text-blue-400 hover:text-blue-300">
            Mesafeli Satış Sözleşmesi
          </a>
          &apos;nde yer almaktadır.
        </p>
      </LegalSection>

      <LegalSection title="İletişim">
        <p>
          Her türlü soru, öneri ve talebin için{" "}
          <a href={`mailto:${C.email}`} className="text-blue-400 hover:text-blue-300">
            {C.email}
          </a>{" "}
          adresinden bize ulaşabilirsin.
        </p>
      </LegalSection>

      <p className="text-gray-600 text-xs border-t border-white/[0.08] pt-6">
        {C.brand} bağımsız bir hizmettir; LinkedIn Corporation ile herhangi bir
        bağlantısı, ortaklığı veya onayı yoktur.
      </p>
    </LegalPage>
  )
}

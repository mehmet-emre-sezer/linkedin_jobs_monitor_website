import LegalPage, { LegalSection } from "@/components/LegalPage"
import { COMPANY as C, PLAN } from "@/constants/company"

export const metadata = {
  title: `Teslimat ve İade Şartları · ${C.brand}`,
  description: "Dijital abonelik hizmetinin teslimatı ve iptal/iade şartları.",
}

export default function DeliveryReturnPage() {
  return (
    <LegalPage title="Teslimat ve İade Şartları" updatedAt="1 Ağustos 2026">
      <LegalSection title="Hizmetin Niteliği">
        <p>
          {C.brand} tamamen dijital bir abonelik hizmetidir. Fiziksel bir ürün
          gönderimi yoktur; hizmet elektronik ortamda sunulur.
        </p>
      </LegalSection>

      <LegalSection title="Teslimat (Hizmete Erişim)">
        <p>
          Abonelik başlatıldığında hizmete erişim <strong className="text-gray-300">anında</strong>{" "}
          sağlanır. {PLAN.trialDays} günlük ücretsiz deneme, kart bilgisi girildiği
          anda başlar ve taramalar aynı akşam devreye girer. Ayrıca herhangi bir
          teslimat süresi veya kargo söz konusu değildir.
        </p>
      </LegalSection>

      <LegalSection title="İptal">
        <p>
          Aboneliğini dilediğin zaman hesabındaki <strong className="text-gray-300">Ayarlar</strong>{" "}
          bölümünden iptal edebilirsin. İptal ettiğinde:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>İçinde bulunduğun ödeme döneminin sonuna kadar hizmet devam eder.</li>
          <li>Bir sonraki dönem için herhangi bir ücret tahsil edilmez.</li>
          <li>
            Deneme süresi içinde iptal edersen hiçbir ücret ödemezsin.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="İade">
        <p>
          Dijital hizmetin niteliği gereği, ödeme dönemi başladıktan sonra o dönem
          için ücret iadesi yapılmaz; ancak iptal ile bir sonraki dönemin
          ücretlendirilmesi durdurulur. Yanlış veya mükerrer tahsilat gibi
          durumlarda{" "}
          <a href={`mailto:${C.email}`} className="text-blue-400 hover:text-blue-300">
            {C.email}
          </a>{" "}
          adresine ulaşman hâlinde talebin incelenir ve haklı bulunması durumunda
          ödeme, tahsilatın yapıldığı karta iade edilir.
        </p>
      </LegalSection>

      <LegalSection title="İletişim">
        <p>
          İptal, iade ve her türlü destek talebin için:{" "}
          <a href={`mailto:${C.email}`} className="text-blue-400 hover:text-blue-300">
            {C.email}
          </a>{" "}
          · {C.phone}
        </p>
      </LegalSection>
    </LegalPage>
  )
}

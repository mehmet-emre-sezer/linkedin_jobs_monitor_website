import LegalPage, { LegalSection } from "@/components/LegalPage"
import { COMPANY as C, PLAN } from "@/constants/company"

export const metadata = {
  title: `Mesafeli Satış Sözleşmesi · ${C.brand}`,
  description: "Abonelik hizmetine ilişkin mesafeli satış sözleşmesi.",
}

export default function DistanceSalesPage() {
  return (
    <LegalPage title="Mesafeli Satış Sözleşmesi" updatedAt="1 Ağustos 2026">
      <LegalSection title="1. Taraflar">
        <p>
          İşbu Mesafeli Satış Sözleşmesi, aşağıda bilgileri yer alan Satıcı ile
          hizmete abone olan Alıcı (tüketici) arasında elektronik ortamda
          kurulmuştur.
        </p>
        <p>
          <strong className="text-gray-300">Satıcı:</strong> {C.legalName}
          <br />
          Adres: {C.address}
          <br />
          Vergi Dairesi / No: {C.taxOffice} · {C.taxNumber}
          <br />
          Telefon: {C.phone}
          <br />
          E-posta: {C.email}
        </p>
        <p>
          <strong className="text-gray-300">Alıcı:</strong> {C.brand} hesabını
          oluştururken belirttiği ad, e-posta ve iletişim bilgileriyle hizmete abone
          olan gerçek kişi.
        </p>
      </LegalSection>

      <LegalSection title="2. Sözleşmenin Konusu">
        <p>
          İşbu sözleşmenin konusu, Satıcı&apos;nın sunduğu {C.brand} dijital abonelik
          hizmetinin Alıcı tarafından satın alınmasına ilişkin olarak tarafların
          hak ve yükümlülüklerinin belirlenmesidir.
        </p>
      </LegalSection>

      <LegalSection title="3. Hizmet ve Ücret">
        <p>
          <strong className="text-gray-300">Hizmet:</strong> {C.brand}, Alıcı&apos;nın
          belirlediği tercihlere göre iş ilanlarını tarayıp puanlayarak Telegram
          üzerinden ileten dijital bir abonelik hizmetidir.
        </p>
        <p>
          <strong className="text-gray-300">Ücret:</strong> Aylık {PLAN.priceTry},00 TL
          (KDV dahil). Abonelik, {PLAN.trialDays} günlük ücretsiz deneme süresiyle
          başlar; deneme süresi sonunda Alıcı iptal etmediği takdirde abonelik ücreti
          Alıcı&apos;nın kayıtlı kartından otomatik olarak tahsil edilir ve her ay
          yenilenir.
        </p>
        <p>
          Ödeme işlemleri, ödeme kuruluşu iyzico altyapısı üzerinden güvenli şekilde
          gerçekleştirilir. Kart bilgileri Satıcı tarafından görülmez ve saklanmaz.
        </p>
      </LegalSection>

      <LegalSection title="4. Hizmetin İfası">
        <p>
          Hizmet dijitaldir; fiziksel teslimat yoktur. Abonelik başladığında hizmete
          erişim elektronik ortamda anında sağlanır ve taramalar aynı gün başlar.
        </p>
      </LegalSection>

      <LegalSection title="5. Cayma Hakkı ve İptal">
        <p>
          Alıcı, aboneliğini dilediği zaman hesabındaki Ayarlar bölümünden ya da{" "}
          {C.email} adresine bildirerek iptal edebilir. İptal edildiğinde, içinde
          bulunulan ödeme döneminin sonuna kadar hizmet devam eder ve bir sonraki
          dönem için ücret tahsil edilmez.
        </p>
        <p>
          {PLAN.trialDays} günlük deneme süresi boyunca herhangi bir ücret alınmaz;
          bu süre içinde iptal eden Alıcı&apos;dan hiçbir ödeme yapılmaz.
        </p>
        <p>
          Anında ifa edilen dijital hizmetlerde, 6502 sayılı Tüketicinin Korunması
          Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, hizmetin
          Alıcı&apos;nın onayıyla ifasına başlanmasından sonra cayma hakkı
          kullanılamaz. Bununla birlikte Satıcı, yukarıda belirtildiği şekilde
          dilediğin zaman iptal ve ücretsiz deneme imkânı sunar.
        </p>
      </LegalSection>

      <LegalSection title="6. Uyuşmazlıkların Çözümü">
        <p>
          İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca
          ilan edilen parasal sınırlar dâhilinde Alıcı&apos;nın yerleşim yerindeki
          Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
        </p>
      </LegalSection>

      <LegalSection title="7. Yürürlük">
        <p>
          Alıcı, abonelik satın alma işlemini tamamladığında işbu sözleşmenin tüm
          şartlarını okuduğunu, anladığını ve kabul ettiğini beyan eder. Sözleşme,
          ödemenin onaylanmasıyla yürürlüğe girer.
        </p>
      </LegalSection>
    </LegalPage>
  )
}

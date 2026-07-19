import Link from "next/link"
import { APP_NAME } from "@/constants/app"

export const metadata = {
  title: `Gizlilik Politikası · ${APP_NAME}`,
  description: `${APP_NAME} hangi kişisel verileri topluyor, neden işliyor ve kimlerle paylaşıyor.`,
}

const LAST_UPDATED = "20 Temmuz 2026"
const CONTACT_EMAIL = "iletisim@ispusulasi.com"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-white text-lg font-semibold mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Ana sayfa
        </Link>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2">Gizlilik Politikası</h1>
        <p className="text-gray-600 text-sm mb-12">Son güncelleme: {LAST_UPDATED}</p>

        <Section title="Özet">
          <p>
            {APP_NAME}, sana uygun iş ilanlarını bulup Telegram üzerinden iletmek için
            çalışır. Bunu yapabilmek için becerilerini, arama tercihlerini ve
            (yüklersen) CV&apos;ni işleriz. Verini reklam amacıyla kullanmayız ve
            üçüncü taraflara satmayız.
          </p>
        </Section>

        <Section title="Hangi verileri topluyoruz?">
          <p>
            <strong className="text-gray-300">Hesap bilgileri:</strong> e-posta
            adresin, parolan (geri döndürülemez şekilde şifrelenmiş olarak saklanır),
            kayıt ve son giriş tarihlerin.
          </p>
          <p>
            <strong className="text-gray-300">Google ile giriş yaptıysan:</strong>{" "}
            Google hesap kimliğin, e-posta adresin ve ad soyadın. Ad soyad yalnızca
            profilini önceden doldurmak için kullanılır ve dilediğin zaman
            değiştirebilirsin. Profil fotoğrafın veya Google hesabındaki diğer
            bilgilere erişmiyoruz.
          </p>
          <p>
            <strong className="text-gray-300">Profil bilgileri:</strong> ad soyad,
            üniversite, mezuniyet yılı, eklediğin beceriler.
          </p>
          <p>
            <strong className="text-gray-300">CV:</strong> yüklediğin dosya ve
            içinden çıkarılan metin. CV yüklemek zorunlu değildir; yüklemezsen
            eşleştirme yalnızca becerilerin üzerinden yapılır.
          </p>
          <p>
            <strong className="text-gray-300">Arama tercihleri:</strong> hedef roller,
            seviyeler, şehirler ve çalışma şekli.
          </p>
          <p>
            <strong className="text-gray-300">Telegram:</strong> botu bağladığında
            Telegram sohbet kimliğin. Telefon numaranı veya kişilerini görmeyiz.
          </p>
          <p>
            <strong className="text-gray-300">Kullanım kayıtları:</strong> senin için
            bulunan ilanlar, tarama geçmişi ve hata kayıtları.
          </p>
        </Section>

        <Section title="Neden işliyoruz?">
          <p>
            Verilerini yalnızca hizmeti sunmak için işleriz: ilanları senin profiline
            göre puanlamak, eşleşenleri Telegram&apos;a göndermek, hesabını yönetmek
            ve e-posta doğrulama gibi güvenlik adımlarını yürütmek.
          </p>
          <p>
            Hukuki dayanak, aramızdaki sözleşmenin (hizmet kullanımı) ifasıdır; CV
            işleme gibi adımlar ise senin açık talebin üzerine gerçekleşir.
          </p>
        </Section>

        <Section title="Kimlerle paylaşıyoruz?">
          <p>
            Hizmetin çalışabilmesi için sınırlı sayıda tedarikçi kullanıyoruz.
            Verini kimseye satmıyoruz.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-gray-300">Groq (yapay zekâ):</strong> ilanların
              sana uygunluğunu puanlamak için becerilerin, CV metnin ve ilan
              açıklaması bu servise gönderilir. CV yüklemezsen CV metni gönderilmez.
            </li>
            <li>
              <strong className="text-gray-300">Telegram:</strong> eşleşen ilan
              bildirimleri bot üzerinden sana iletilir.
            </li>
            <li>
              <strong className="text-gray-300">Resend:</strong> doğrulama ve parola
              sıfırlama e-postaları için e-posta adresin kullanılır.
            </li>
            <li>
              <strong className="text-gray-300">Railway ve Vercel:</strong> uygulama
              ve veritabanı bu altyapılarda barındırılır.
            </li>
          </ul>
          <p>
            Bu tedarikçilerin sunucuları yurt dışında bulunabilir; hizmeti kullanarak
            verinin bu kapsamda yurt dışına aktarılabileceğini kabul etmiş olursun.
          </p>
        </Section>

        <Section title="Ne kadar süre saklıyoruz?">
          <p>
            Verilerini hesabın açık kaldığı sürece saklarız. Hesabını sildiğinde
            profilin, CV&apos;n, arama tercihlerin, ilan geçmişin ve Telegram
            bağlantın kalıcı olarak silinir. Silme işlemi Ayarlar sayfasından
            tek tıkla yapılabilir ve geri alınamaz.
          </p>
        </Section>

        <Section title="Haklarını nasıl kullanırsın?">
          <p>
            Kişisel verilerine erişme, düzeltme, silme ve işlemeye itiraz etme
            hakkın var. Profil ve arama bilgilerini istediğin zaman{" "}
            <span className="text-gray-300">Profilim</span> sayfasından
            güncelleyebilir, hesabını{" "}
            <span className="text-gray-300">Ayarlar</span> sayfasından
            silebilirsin.
          </p>
          <p>
            Bu yolları yeterli bulmazsan{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:text-blue-300">
              {CONTACT_EMAIL}
            </a>{" "}
            adresine yazabilirsin.
          </p>
        </Section>

        <Section title="Güvenlik">
          <p>
            Parolalar geri döndürülemez şekilde şifrelenerek saklanır; düz metin
            olarak tutulmaz. Tüm bağlantılar HTTPS üzerinden yapılır. Oturum
            bilgin tarayıcının yerel depolamasında tutulur — ortak bir cihaz
            kullanıyorsan çıkış yapmayı unutma.
          </p>
          <p>
            Hiçbir sistem %100 güvenli değildir; verini korumak için makul teknik
            önlemleri alırız ancak mutlak güvenlik garantisi veremeyiz.
          </p>
        </Section>

        <Section title="Çerezler">
          <p>
            Reklam veya takip çerezi kullanmıyoruz. Oturumun açık kalması için
            tarayıcının yerel depolama alanını kullanıyoruz. Ayrıca ziyaretçi
            sayısını ölçmek için Vercel Analytics kullanılır; bu araç kişisel
            veri toplamadan sayfa görüntülemelerini ölçer.
          </p>
        </Section>

        <Section title="Değişiklikler">
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli bir değişiklik
            olduğunda sayfanın üstündeki tarih güncellenir.
          </p>
        </Section>

        <Section title="İletişim">
          <p>
            Soruların için:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:text-blue-300">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <p className="text-gray-600 text-xs border-t border-white/[0.08] pt-6">
          {APP_NAME} bağımsız bir hizmettir; LinkedIn Corporation ile herhangi bir
          bağlantısı, ortaklığı veya onayı yoktur.
        </p>
      </main>
    </div>
  )
}

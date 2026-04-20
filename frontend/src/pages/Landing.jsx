import { APP_NAME, APP_TAGLINE } from "../constants/app"

const steps = [
  {
    number: "01",
    title: "Profilini oluştur",
    desc: "CV'ni yükle, sistem seni tanısın.",
  },
  {
    number: "02",
    title: "Aramalar otomatik kurulur",
    desc: "Yapay zeka, profiline göre LinkedIn arama sorgularını hazırlar.",
  },
  {
    number: "03",
    title: "Telegram'a bağlan",
    desc: "Bota /start yaz, bildirimler anında gelsin.",
  },
  {
    number: "04",
    title: "Bekle, biz tarayalım",
    desc: "Her gün 3 kez LinkedIn taranır, sana uygun ilanlar puanlanır ve iletilir.",
  },
]

const features = [
  {
    icon: "🎯",
    title: "Skor tabanlı filtreleme",
    desc: "Her ilan profilinle kıyaslanır, 100 üzerinden puanlanır. Düşük puanlı ilanlar sana gelmiyor.",
  },
  {
    icon: "⚡",
    title: "Günde 3 tarama",
    desc: "Sabah, öğlen, akşam. Yeni bir ilan açıldığında saatler içinde haberin olur.",
  },
  {
    icon: "🤖",
    title: "Akıllı sorgular",
    desc: "Arama sorguları zamanla optimize edilir, daha az gürültü daha fazla isabet.",
  },
  {
    icon: "📲",
    title: "Telegram bildirimleri",
    desc: "Uygulama kurmak yok. Zaten kullandığın Telegram üzerinden.",
  },
]

function TelegramMock() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-75" />

      {/* Phone frame */}
      <div className="relative bg-[#1e2029] rounded-3xl p-4 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">🤖</div>
          <div>
            <div className="text-white text-sm font-medium">{APP_NAME} Bot</div>
            <div className="text-gray-500 text-xs">çevrimiçi</div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <div className="bg-[#2a2d3a] rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
            <div className="text-xs text-blue-400 font-medium mb-1">🆕 Yeni İlan — 87 puan</div>
            <div className="text-white text-sm font-medium">Junior ML Engineer</div>
            <div className="text-gray-400 text-xs mt-0.5">Trendyol · İstanbul (Hibrit)</div>
            <div className="text-gray-500 text-xs mt-2 leading-relaxed">
              Python, scikit-learn, 0-2 yıl deneyim. Staj veya yeni mezun kabul edilir.
            </div>
            <div className="mt-2">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                İlana git →
              </span>
            </div>
          </div>

          <div className="bg-[#2a2d3a] rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
            <div className="text-xs text-green-400 font-medium mb-1">📊 Günlük Özet</div>
            <div className="text-gray-300 text-xs leading-relaxed">
              Bugün <span className="text-white font-medium">12</span> ilan tarandı,{" "}
              <span className="text-white font-medium">3</span> tanesi sana iletildi.
              <br />
              Ortalama skor: <span className="text-white font-medium">79/100</span>
            </div>
          </div>
        </div>

        {/* Input mock */}
        <div className="mt-3 bg-[#2a2d3a] rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-gray-600 text-sm flex-1">Mesaj...</span>
          <span className="text-blue-500 text-lg">↑</span>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-lg text-white tracking-tight">{APP_NAME}</span>
        <a
          href="/register"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          Ücretsiz Başla
        </a>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-6">
              Beta — erken erişim açık
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-5">
              LinkedIn'i sen taramak{" "}
              <span className="text-blue-400">zorunda değilsin</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              {APP_TAGLINE}. CV'ni yükle, yapay zeka aramaları kursun,
              ilanlar Telegram'a gelsin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors text-center"
              >
                Hemen başla — ücretsiz
              </a>
              <a
                href="#nasil-calisir"
                className="border border-white/10 text-gray-400 px-6 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors text-center"
              >
                Nasıl çalışır?
              </a>
            </div>
          </div>
          <TelegramMock />
        </section>

        {/* Divider */}
        <div className="border-t border-white/5 my-4" />

        {/* How it works */}
        <section id="nasil-calisir" className="py-10 lg:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Nasıl çalışır?</h2>
            <p className="text-gray-500 text-sm">Kurulum 5 dakika, gerisini sistem halleder.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-white/10 z-10" />
                )}
                <div className="text-blue-400 font-mono text-xs font-semibold mb-3">{step.number}</div>
                <div className="font-medium text-white mb-1.5 text-sm">{step.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Features */}
        <section className="py-10 lg:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Ne yapıyor?</h2>
            <p className="text-gray-500 text-sm">Temel özellikler, fazlası değil.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-all"
              >
                <span className="text-2xl leading-none mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <div className="font-medium text-white mb-1 text-sm">{f.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 lg:py-16">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Dene, ne kaybedersin ki?</h2>
            <p className="text-gray-400 mb-7 text-sm">Şu an ücretsiz. Ödeme bilgisi istemiyoruz.</p>
            <a
              href="/register"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Hesap oluştur
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600 max-w-5xl mx-auto px-6">
        © {new Date().getFullYear()} {APP_NAME}. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}

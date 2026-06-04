interface Props {
  totalUsers: number
  activeUsers: number
  registeredToday: number
  errorsLast24h: number
}

interface CardData {
  label: string
  value: number
  hint: string
  accentColor: string
}

export default function AdminStatCards({
  totalUsers,
  activeUsers,
  registeredToday,
  errorsLast24h,
}: Props) {
  const cards: CardData[] = [
    { label: "Toplam Kullanıcı", value: totalUsers,       hint: "Tüm zamanlar",       accentColor: "text-blue-400"  },
    { label: "Aktif Kullanıcı",  value: activeUsers,      hint: "Son 7 gün",          accentColor: "text-green-400" },
    { label: "Bugün Kayıt",      value: registeredToday,  hint: "Yeni hesap",         accentColor: "text-purple-400"},
    { label: "Hata Sayısı",      value: errorsLast24h,    hint: "Son 24 saat",        accentColor: "text-red-400"   },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-colors"
        >
          <div className="text-xs text-gray-500 mb-2">{card.label}</div>
          <div className={`text-3xl font-bold tabular-nums ${card.accentColor}`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-600 mt-1">{card.hint}</div>
        </div>
      ))}
    </div>
  )
}

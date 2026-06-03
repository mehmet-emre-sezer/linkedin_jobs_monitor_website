interface Props {
  scanned: number
  sent: number
  averageScore: number
  maxScore: number
}

interface CardData {
  label: string
  value: number
  hint: string
}

export default function StatCards({ scanned, sent, averageScore, maxScore }: Props) {
  const cards: CardData[] = [
    { label: "Taranan ilan",   value: scanned,      hint: "Bu hafta" },
    { label: "Sana iletilen",  value: sent,         hint: "Bu hafta" },
    { label: "Ortalama skor",  value: averageScore, hint: "/ 100" },
    { label: "En yüksek skor", value: maxScore,     hint: "/ 100" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-colors"
        >
          <div className="text-xs text-gray-500 mb-2">{card.label}</div>
          <div className="text-3xl font-bold text-white tabular-nums">
            {card.value}
          </div>
          <div className="text-xs text-gray-600 mt-1">{card.hint}</div>
        </div>
      ))}
    </div>
  )
}

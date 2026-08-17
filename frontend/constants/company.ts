// Satıcı/işletme kimliği — yasal sayfalar ve footer tek kaynak olarak burayı kullanır.
// Değişirse tek yerden güncellenir.

export const COMPANY = {
  legalName: "TSCPOS BİLİŞİM",
  brand: "İş Pusulası",
  address: "Odunluk Mahallesi Karamanlı Sokak No:28B Daire:1 Nilüfer / Bursa",
  taxOffice: "Setbaşı V.D.",
  taxNumber: "7670318595",
  phone: "0553 292 40 91",
  email: "iletisim@ispusulasi.com",
  website: "https://ispusulasi.com",
} as const

// Abonelik planı — fiyat sunucu tarafındaki config ile aynı tutulmalı.
export const PLAN = {
  priceTry: 79,
  trialDays: 5,
} as const

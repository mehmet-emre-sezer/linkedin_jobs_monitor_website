import type { Metadata } from "next"
import "./globals.css"
import Providers from "./providers"

// TODO: APP_NAME belirlendikten sonra güncelle
export const metadata: Metadata = {
  title: "JobRadar",
  description: "LinkedIn iş ilanlarını senin için takip eder.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0f1117] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

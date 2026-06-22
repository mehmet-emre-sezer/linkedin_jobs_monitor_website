import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Providers from "./providers"
import { APP_NAME, APP_TAGLINE } from "@/constants/app"

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_TAGLINE}.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0f1117] antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}

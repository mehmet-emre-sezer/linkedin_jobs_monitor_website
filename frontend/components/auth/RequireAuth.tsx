"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

/**
 * Korumalı sayfa kapısı:
 *  - Giriş yapılmamışsa → /login
 *  - Giriş var ama e-posta doğrulanmamışsa → /verify-email (sert kapı)
 * Çocuklar yalnızca oturum açık VE e-posta doğrulanmışken render olur.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    } else if (!user.is_email_verified) {
      router.replace("/verify-email")
    }
  }, [isLoading, user, router])

  if (isLoading || !user || !user.is_email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] text-gray-400">
        Yükleniyor…
      </div>
    )
  }

  return <>{children}</>
}

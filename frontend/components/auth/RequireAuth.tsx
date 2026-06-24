"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

/**
 * Giriş yapmamış kullanıcıyı /login'e yönlendirir.
 * Çocuklar yalnızca oturum açıkken render olur (içerideki veri çekme de o zaman başlar).
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] text-gray-400">
        Yükleniyor…
      </div>
    )
  }

  return <>{children}</>
}

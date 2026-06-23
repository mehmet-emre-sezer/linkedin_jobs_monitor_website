"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

/**
 * /admin alt ağacını korur: yalnızca is_admin kullanıcılar paneli görür.
 * Giriş yoksa /login'e, admin değilse anasayfaya yönlendirir.
 *
 * Not: Bu istemci tarafı bir UX korumasıdır. Gerçek güvenlik backend'de
 * require_admin (403) ile sağlanır — admin endpoint'leri zaten orada korunuyor.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const isAuthorized = !isLoading && user?.is_admin === true

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    } else if (!user.is_admin) {
      router.replace("/")
    }
  }, [isLoading, user, router])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] text-gray-400">
        {isLoading ? "Yükleniyor…" : "Yetkisiz erişim — yönlendiriliyorsun…"}
      </div>
    )
  }

  return <>{children}</>
}

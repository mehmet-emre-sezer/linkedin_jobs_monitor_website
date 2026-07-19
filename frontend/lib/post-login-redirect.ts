import { api } from "@/lib/api"
import type { AuthUser } from "@/lib/auth-types"
import type { ProfileResponse } from "@/lib/profile-types"

/**
 * Giriş sonrası kullanıcının gideceği sayfa.
 *
 * Parola girişi ve Google girişi bu mantığı paylaşır — ayrı ayrı yazıldığında
 * birbirinden kaymıştı (Google kullanıcıları onboarding'i atlıyordu, çünkü
 * `is_email_verified` Google'dan hep true geliyor).
 */
export async function resolvePostLoginPath(user: AuthUser): Promise<string> {
  if (user.is_admin) return "/admin"

  // Sert kapı: e-posta doğrulanmamışsa başka hiçbir yere gidilmez.
  if (!user.is_email_verified) return "/verify-email"

  // Onboarding'i bitirmeyen kullanıcı dashboard'a alınmaz: arama tercihi
  // girmediyse hiç sorgusu olmaz, yani ürün onun için çalışmaz.
  try {
    const { data: profile } = await api.get<ProfileResponse>("/profile/me")
    return profile.onboarding_completed ? "/dashboard" : "/onboarding"
  } catch {
    // Profil çekilemedi — onboarding'e göndermek güvenli taraf.
    return "/onboarding"
  }
}

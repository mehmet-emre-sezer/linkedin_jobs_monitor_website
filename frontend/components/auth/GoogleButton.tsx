"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { resolvePostLoginPath } from "@/lib/post-login-redirect"
import type { TokenResponse } from "@/lib/auth-types"

interface Props {
  onError?: (message: string) => void
}

export default function GoogleButton({ onError }: Props) {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      onError?.("Google girişi tamamlanamadı.")
      return
    }

    setIsLoading(true)
    try {
      const { data } = await api.post<TokenResponse>("/auth/google", {
        id_token: response.credential,
      })
      login(data)
      router.push(await resolvePostLoginPath(data.user))
    } catch (err) {
      onError?.(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.("Google girişi başarısız.")}
        theme="filled_black"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-xs text-gray-300">
          Bağlanıyor…
        </div>
      )}
    </div>
  )
}

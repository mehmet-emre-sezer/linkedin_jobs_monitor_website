"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { resolvePostLoginPath } from "@/lib/post-login-redirect"
import type { TokenResponse } from "@/lib/auth-types"

interface Props {
  onError?: (message: string) => void
}

// Google'ın kimlik butonu genişlikte yüzde kabul etmiyor (piksel bekler) ve
// 400px'i aşamıyor. Formun diğer alanları daha genişse buton dar kalıp sola
// yaslanıyor; bu yüzden 400px'te çizip kapsayıcıya kadar ölçekliyoruz.
const GOOGLE_BUTTON_MAX_WIDTH = 400

export default function GoogleButton({ onError }: Props) {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [innerHeight, setInnerHeight] = useState(0)

  // Kapsayıcı genişliğini izle — responsive kırılımlarda da doğru kalsın.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Butonun doğal yüksekliği: ölçeklenince kapsayıcı yüksekliğini buna göre
  // ayarlıyoruz, yoksa altındaki içerik kayıyor.
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setInnerHeight(entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerWidth])

  const buttonWidth = Math.min(containerWidth, GOOGLE_BUTTON_MAX_WIDTH)
  const scale = buttonWidth > 0 ? containerWidth / buttonWidth : 1

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
    <div
      ref={containerRef}
      className="relative"
      style={{ height: innerHeight ? innerHeight * scale : undefined }}
    >
      {buttonWidth > 0 && (
        <div
          ref={innerRef}
          style={{
            width: buttonWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError?.("Google girişi başarısız.")}
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={buttonWidth}
          />
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-xs text-gray-300">
          Bağlanıyor…
        </div>
      )}
    </div>
  )
}

"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { api, getToken, setToken, clearToken } from "./api"
import type { AuthUser, TokenResponse } from "./auth-types"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (response: TokenResponse) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // İlk açılışta token varsa kullanıcıyı çek
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    refresh().finally(() => setIsLoading(false))
  }, [])

  async function refresh() {
    try {
      const response = await api.get<AuthUser>("/auth/me")
      setUser(response.data)
    } catch {
      clearToken()
      setUser(null)
    }
  }

  function login(response: TokenResponse) {
    setToken(response.access_token)
    setUser(response.user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }
  return ctx
}

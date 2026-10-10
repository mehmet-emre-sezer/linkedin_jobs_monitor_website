// Backend response tipleri (Spring backend-v2 — camelCase)

export interface AuthUser {
  id: number
  email: string
  emailVerified: boolean
  admin: boolean
  createdAt: string
}

export interface TokenResponse {
  token: string
  user: AuthUser
}

// Backend response tipleri

export interface AuthUser {
  id: number
  email: string
  is_email_verified: boolean
  is_admin: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

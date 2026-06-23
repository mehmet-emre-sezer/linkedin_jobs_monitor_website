export interface ProfileResponse {
  name: string | null
  university: string | null
  graduation_year: number | null
  skills: string[]
  cv_filename: string | null
  cv_uploaded_at: string | null
  telegram_chat_id: string | null
  onboarding_completed: boolean
  updated_at: string
}

export interface ProfileBasicUpdate {
  name: string
  university: string
  graduation_year: number
}

export interface SkillsUpdate {
  skills: string[]
}

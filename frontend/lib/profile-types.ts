export interface ProfileResponse {
  name: string | null
  university: string | null
  graduation_year: number | null
  skills: string[]
  cv_filename: string | null
  cv_uploaded_at: string | null
  telegram_chat_id: string | null
  onboarding_completed: boolean
  search_locations: string[]
  work_mode: string
  target_roles: string[]
  target_levels: string[]
  updated_at: string
}

export interface SearchPreferencesUpdate {
  search_locations: string[]
  work_mode: string
  target_roles: string[]
  target_levels: string[]
}

export interface ProfileBasicUpdate {
  name: string
  university: string
  graduation_year: number
}

export interface SkillsUpdate {
  skills: string[]
}

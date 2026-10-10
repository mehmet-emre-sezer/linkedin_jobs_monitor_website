export interface ProfileResponse {
  name: string | null
  university: string | null
  graduationYear: number | null
  skills: string[]
  cvFilename: string | null
  cv_uploaded_at: string | null
  telegramChatId: string | null
  onboardingCompleted: boolean
  searchLocations: string[]
  workMode: string
  targetRoles: string[]
  targetLevels: string[]
  updatedAt: string
}

export interface SearchPreferencesUpdate {
  searchLocations: string[]
  workMode: string
  targetRoles: string[]
  targetLevels: string[]
}

export interface ProfileBasicUpdate {
  name: string
  university: string
  graduationYear: number
}

export interface SkillsUpdate {
  skills: string[]
}

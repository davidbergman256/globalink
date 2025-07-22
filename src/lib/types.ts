export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  // Location fields
  hometown: string | null
  zip_code: string | null
  // Personal info
  age: number | null
  mbti_type: string | null
  social_energy: string | null
  friend_qualities: string | null
  plan_preference: string | null
  // Communication & Culture
  languages: string | null
  social_style: string | null
  cultural_preference: string | null
  // System fields
  event_id: string | null
  created_at: string
}

export interface Event {
  id: string
  name: string
  activity: string
  date: string | null
  location: string | null
  created_at: string
} 
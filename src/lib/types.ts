export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  about: string | null
  location: string | null
  fun_fact: string | null
  talk_for_hours: string | null
  group_id: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
} 
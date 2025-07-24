// New types for Globalink Platform

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  user_id: string
  age: number | null
  tags: string[] // max 3
  personality: 'outgoing' | 'shy_at_first' | 'somewhere_in_between' | null
  pref_activity: 'studying_together' | 'exploring_city' | 'gaming_online' | 'trying_foods' | 'other' | null
  branches: Record<string, any> // JSON for branching questionnaire responses
  from_location: string | null
  current_location: string | null
  created_at: string
}

export interface QueueEntry {
  user_id: string
  campus: string
  joined_at: string
}

export interface Group {
  id: string
  status: 'forming' | 'pending_payment' | 'location_revealed' | 'completed' | 'cancelled'
  event_datetime: string | null
  campus: string | null
  member_ids: string[]
  venue_name: string | null
  venue_address: string | null
  created_at: string
}

export interface Payment {
  id: string
  group_id: string
  user_id: string
  status: 'paid' | 'refunded'
  stripe_session_id: string | null
  amount_cents: number
  created_at: string
}

export interface RSVP {
  group_id: string
  user_id: string
  answer: 'yes' | 'no'
  created_at: string
}

export interface Feedback {
  group_id: string
  user_id: string
  stars: number // 1-5
  would_meet_again: boolean | null
  comment: string | null
  created_at: string
}

// Questionnaire types
export interface QuestionnaireAnswers {
  from_location: string
  current_location: string
  personality: 'outgoing' | 'shy_at_first' | 'somewhere_in_between'
  challenge: 'language_barriers' | 'missing_home' | 'finding_interests' | 'other'
  activity: 'studying_together' | 'exploring_city' | 'gaming_online' | 'trying_foods' | 'other'
  
  // Branching questions
  favorite_dish?: string
  likes_spicy?: boolean
  gaming_platform?: 'console' | 'pc' | 'mobile' | 'all'
  current_game?: string
  cultural_pref?: 'same_culture' | 'different_culture' | 'doesnt_matter'
  party_size?: 'big' | 'small'
  study_snack?: string
  current_song?: string
}

// Dashboard types
export interface UserDashboard {
  currentGroup: Group | null
  queueStatus: QueueEntry | null
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | null
  upcomingEvents: Group[]
  pastEvents: Group[]
} 
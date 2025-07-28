import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createSupabaseClient = () => {
  // During build time, return a mock client to prevent errors
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any
  }
  return createClientComponentClient()
} 
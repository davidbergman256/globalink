import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createSupabaseClient = () => {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      }),
      rpc: () => Promise.resolve({ data: null, error: null })
    } as any
  }
  return createClientComponentClient()
} 
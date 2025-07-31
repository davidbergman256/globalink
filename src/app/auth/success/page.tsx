'use client'

import { useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Wait a moment for Supabase to process the magic link
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single()

        if (!profile) {
          // New user - go to questionnaire
          router.push('/questionnaire')
        } else {
          // Existing user - go to dashboard  
          router.push('/')
        }
      } else {
        // No session - back to login
        router.push('/login')
      }
    }

    handleAuth()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#698a7b] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  )
} 
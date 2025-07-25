'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Auth success page loaded')
        
        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setStatus('error')
          return
        }

        if (session?.user) {
          console.log('User authenticated:', session.user.email)
          
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', session.user.id)
            .single()

          console.log('Profile exists:', !!profile)

          if (!profile) {
            console.log('New user, going to questionnaire')
            router.push('/questionnaire')
          } else {
            console.log('Existing user, going to dashboard')
            router.push('/')
          }
        } else {
          console.log('No session found')
          setStatus('no-session')
          setTimeout(() => router.push('/login'), 3000)
        }
      } catch (error) {
        console.error('Auth handling error:', error)
        setStatus('error')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuth()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing your sign in...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <p className="text-red-600 mb-4">Something went wrong</p>
            <p className="text-gray-500">Redirecting to login...</p>
          </>
        )}
        
        {status === 'no-session' && (
          <>
            <p className="text-yellow-600 mb-4">Session not found</p>
            <p className="text-gray-500">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  )
} 
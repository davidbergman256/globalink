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
        console.log('Auth success page loaded, URL:', window.location.href)
        
        // Extract tokens from magic link URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Tokens found:', !!accessToken, !!refreshToken)
        
        if (accessToken && refreshToken) {
          // Set session from magic link tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('Session set error:', sessionError)
            setStatus('error')
            return
          }
          console.log('Session set successfully')
        } else {
          console.log('No tokens found, checking existing session')
        }
        
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check result:', !!session, error)
        
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

          if (!profile) {
            // New user - go to questionnaire
            router.push('/questionnaire')
          } else {
            // Existing user - go to dashboard
            router.push('/')
          }
        } else {
          console.log('No session found, redirecting to login')
          router.push('/login')
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
    <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
      <div className="text-center">
        {status === 'checking' && (
          <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#698a7b] mx-auto mb-4"></div>
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
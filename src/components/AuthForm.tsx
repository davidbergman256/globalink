'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'

export default function AuthForm() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // User is authenticated, check if profile exists
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
          router.push('/app')
        }
      }
    }
    
    checkAuth()
  }, [supabase, router])

    const isValidEmail = (email: string) => {
    // Accept any valid email format now that user curation is manual
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/success`,
          shouldCreateUser: true
        }
      })

      if (error) {
        console.error('Auth error:', error)
        throw error
      }
      
      console.log('Magic link sent successfully')
      setSuccess(true)
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA] py-12 px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h1>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link to complete your registration
          </p>
          <button
            onClick={() => setSuccess(false)}
                          className="mt-4 text-[#698a7b] hover:text-[#7a9d8c] text-sm"
          >
            Try different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">globalink</h1>
          <p className="text-gray-600">Connect with students for amazing experiences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-[#698a7b] focus:border-[#698a7b]"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading || !email || !isValidEmail(email)}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#698a7b] hover:bg-[#5a7a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#698a7b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                Send Magic Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 
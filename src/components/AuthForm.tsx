'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './SupabaseProvider'
import Link from 'next/link'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [funFact, setFunFact] = useState('')
  const [talkForHours, setTalkForHours] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Create profile with additional information
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: displayName,
              location: location,
              fun_fact: funFact,
              talk_for_hours: talkForHours,
            })
          
          if (profileError) throw profileError
        }
        
        router.push('/login?message=Check your email to confirm your account')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResendingEmail(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      
      if (error) throw error
      
      setMessage('Confirmation email sent! Please check your inbox.')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            globalink
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Where are you from?
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="funFact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    One fun fact about you
                  </label>
                  <textarea
                    id="funFact"
                    name="funFact"
                    required
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Share something interesting about yourself..."
                    value={funFact}
                    onChange={(e) => setFunFact(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="talkForHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What topic could you talk for hours?
                  </label>
                  <input
                    id="talkForHours"
                    name="talkForHours"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Your favorite topic..."
                    value={talkForHours}
                    onChange={(e) => setTalkForHours(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {message && (
            <div className="text-green-600 text-sm text-center">{message}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="text-sm text-purple-600 hover:text-purple-500 disabled:opacity-50"
              >
                {resendingEmail ? 'Sending...' : "Haven't confirmed your email? Resend confirmation"}
              </button>
            </div>
          )}

          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/join" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 
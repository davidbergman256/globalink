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
  const [hometown, setHometown] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [age, setAge] = useState('')
  const [mbtiType, setMbtiType] = useState('')
  const [socialEnergy, setSocialEnergy] = useState('')
  const [friendQualities, setFriendQualities] = useState('')
  const [planPreference, setPlanPreference] = useState('')
  const [languages, setLanguages] = useState('')
  const [socialStyle, setSocialStyle] = useState('')
  const [culturalPreference, setCulturalPreference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMeetupEmail = async (userEmail: string, userName: string) => {
    try {
      // Call Supabase Edge Function to send email
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: userEmail,
          name: userName || 'there'
        }
      })
      
      if (error) {
        console.error('Failed to send meetup email:', error)
        // Don't throw error - we don't want to break signup flow for email issues
      }
    } catch (error) {
      console.error('Error sending meetup email:', error)
      // Don't throw error - email is not critical for signup
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Create profile with all the new fields
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: displayName,
              hometown: hometown,
              zip_code: zipCode,
              age: age ? parseInt(age) : null,
              mbti_type: mbtiType,
              social_energy: socialEnergy,
              friend_qualities: friendQualities,
              plan_preference: planPreference,
              languages: languages,
              social_style: socialStyle,
              cultural_preference: culturalPreference,
            })
          
          if (profileError) throw profileError
          
          // Send meetup organization email
          await sendMeetupEmail(email, displayName)
        }
        
        router.push('/')
        router.refresh() // Force a refresh to ensure proper redirect
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh() // Force a refresh to ensure proper redirect
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
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
            {mode === 'login' ? 'Sign in to your account' : 'Join globalink'}
          </h2>
          {mode === 'signup' && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Connect with strangers for amazing experiences
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          
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
                    placeholder="How should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="99"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="hometown" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What city and country are you from?
                  </label>
                  <input
                    id="hometown"
                    name="hometown"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. Prague, Czech Republic"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What&apos;s your zip code?
                  </label>
                                      <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      maxLength={10}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. 10001"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="mbtiType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What&apos;s your MBTI type? (optional)
                  </label>
                  <input
                    id="mbtiType"
                    name="mbtiType"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. INFP"
                    value={mbtiType}
                    onChange={(e) => setMbtiType(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="socialEnergy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Do you consider yourself extroverted, introverted, or ambivert?
                  </label>
                  <input
                    id="socialEnergy"
                    name="socialEnergy"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. extroverted"
                    value={socialEnergy}
                    onChange={(e) => setSocialEnergy(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="friendQualities" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What do you look for in a friend?
                  </label>
                  <input
                    id="friendQualities"
                    name="friendQualities"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. honesty, humor, reliability"
                    value={friendQualities}
                    onChange={(e) => setFriendQualities(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="planPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Do you prefer spontaneous plans or organized events?
                  </label>
                  <input
                    id="planPreference"
                    name="planPreference"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. spontaneous plans"
                    value={planPreference}
                    onChange={(e) => setPlanPreference(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Which languages are you fluent in or learning?
                  </label>
                  <input
                    id="languages"
                    name="languages"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. English, Mandarin, Spanish"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="socialStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What&apos;s your ideal way to socialize?
                  </label>
                  <input
                    id="socialStyle"
                    name="socialStyle"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. coffee chat, online gaming, group hike"
                    value={socialStyle}
                    onChange={(e) => setSocialStyle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="culturalPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Do you prefer friends from similar cultural backgrounds or diverse ones?
                  </label>
                  <input
                    id="culturalPreference"
                    name="culturalPreference"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g. diverse ones"
                    value={culturalPreference}
                    onChange={(e) => setCulturalPreference(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Join globalink'}
            </button>
          </div>

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
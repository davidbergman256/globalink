'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [funFact, setFunFact] = useState('')
  const [talkForHours, setTalkForHours] = useState('')

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setProfile(data)
          setDisplayName(data.display_name || '')
          setLocation(data.location || '')
          setFunFact(data.fun_fact || '')
          setTalkForHours(data.talk_for_hours || '')
        }
      } catch (error: any) {
        alert('Error loading profile: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase, router])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        display_name: displayName,
        location: location,
        fun_fact: funFact,
        talk_for_hours: talkForHours,
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error

      alert('Profile updated successfully!')
      router.push('/profile')
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Profile
          </h1>

          <form onSubmit={updateProfile} className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Where are you from?
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="City, Country"
                required
              />
            </div>

            <div>
              <label
                htmlFor="funFact"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                One fun fact about you
              </label>
              <textarea
                id="funFact"
                rows={3}
                value={funFact}
                onChange={(e) => setFunFact(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Share something interesting about yourself..."
                required
              />
            </div>

            <div>
              <label
                htmlFor="talkForHours"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                What topic could you talk for hours?
              </label>
              <input
                type="text"
                id="talkForHours"
                value={talkForHours}
                onChange={(e) => setTalkForHours(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your favorite topic to discuss..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
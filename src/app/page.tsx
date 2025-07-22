import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import type { Profile, Event } from '@/lib/types'

async function getProfile() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

async function getEvent(eventId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  return event
}

async function getEventMembers(eventId: string, currentUserId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: members } = await supabase
    .from('profiles')
    .select('display_name, age')
    .eq('event_id', eventId)
    .neq('id', currentUserId) // Exclude current user
    .order('display_name')

  return members || []
}

export default async function HomePage() {
  const profile = await getProfile()
  
  if (!profile?.event_id) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to globalink
          </h1>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              We&apos;re connecting you to your group!
            </h2>
            <p className="text-blue-800 dark:text-blue-200">
              Sit tight - we&apos;ll organize an amazing meetup experience for you soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const event = await getEvent(profile.event_id)
  const members = await getEventMembers(profile.event_id, profile.id)
  
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Event information not available.
          </p>
        </div>
      </div>
    )
  }

  // Format member names with ages
  const memberNamesWithAges = members
    .map(m => m.display_name && m.age ? `${m.display_name} (${m.age})` : m.display_name)
    .filter(Boolean)
    .join(', ')
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your Event
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {event.name}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {event.activity} {memberNamesWithAges && `with ${memberNamesWithAges}`}
          </p>
          
          {event.date && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                📅 {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          
          {event.location && (
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                📍 {event.location}
              </span>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Event Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;ll send you more details about your meetup via email soon. Get ready for an awesome experience!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

async function getProfile() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { profile, user }
}

export default async function ProfilePage() {
  const { profile, user } = await getProfile()
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <Image
                  className="h-24 w-24 rounded-full object-cover"
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  width={96}
                  height={96}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.display_name || 'No display name set'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              
              {profile?.location && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  📍 <strong>From:</strong> {profile.location}
                </p>
              )}
              
              {profile?.fun_fact && (
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  ✨ <strong>Fun fact:</strong> {profile.fun_fact}
                </p>
              )}
              
              {profile?.talk_for_hours && (
                <p className="mt-1 text-purple-600 dark:text-purple-400">
                  💬 <strong>Could talk for hours about:</strong> {profile.talk_for_hours}
                </p>
              )}
              
              <div className="mt-4">
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Edit Profile
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
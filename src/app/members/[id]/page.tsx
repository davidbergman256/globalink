import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect, notFound } from 'next/navigation'
import { User } from 'lucide-react'
import Image from 'next/image'

async function getMemberProfile(id: string) {
  const supabase = createSupabaseServerClient()
  
  // Verify current user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user's profile to check group_id
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('group_id')
    .eq('id', user.id)
    .single()

  // Get the member's profile
  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // Check if member exists and is in the same group
  if (!memberProfile || !currentProfile?.group_id || 
      memberProfile.group_id !== currentProfile.group_id) {
    notFound()
  }

  return memberProfile
}

export default async function MemberPage({ params }: { params: { id: string } }) {
  const profile = await getMemberProfile(params.id)
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
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
                {profile.display_name || 'Anonymous'}
              </h1>
              
              {profile.location && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  📍 <strong>From:</strong> {profile.location}
                </p>
              )}
              
              {profile.fun_fact && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  ✨ <strong>Fun fact:</strong> {profile.fun_fact}
                </p>
              )}
              
              {profile.talk_for_hours && (
                <p className="mt-2 text-purple-600 dark:text-purple-400">
                  💬 <strong>Could talk for hours about:</strong> {profile.talk_for_hours}
                </p>
              )}
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
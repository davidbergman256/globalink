import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import GroupCard from '@/components/GroupCard'
import type { Profile } from '@/lib/types'

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

async function getGroupMates(groupId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: groupMates } = await supabase
    .from('profiles')
    .select('*')
    .eq('group_id', groupId)
    .order('display_name')

  return groupMates || []
}

export default async function HomePage() {
  const profile = await getProfile()
  
  if (!profile?.group_id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to globalink
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 max-w-md mx-auto">
            <p className="text-yellow-800 dark:text-yellow-200">
              Waiting for group assignment. Please contact support to be added to a group.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const groupMates = await getGroupMates(profile.group_id)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Group
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with your group members
        </p>
      </div>

      {groupMates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No other group members yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groupMates.map((mate) => (
            <GroupCard key={mate.id} profile={mate} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <a
          href="https://discord.gg/mX57EEm3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Join Discord
        </a>
      </div>
    </div>
  )
} 
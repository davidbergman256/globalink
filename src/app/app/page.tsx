import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

async function getUserData() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Middleware ensures we have a user here
  if (!user) {
    redirect('/login')
  }

  // Ensure user has required email field
  const userWithEmail = {
    ...user,
    email: user.email || ''
  }

  // Check if user has completed profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/questionnaire')
  }

  // Get queue status
  const { data: queueEntry } = await supabase
    .from('queue')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get current group
  const { data: currentGroup } = await supabase.rpc('get_user_current_group', {
    p_user_id: user.id
  })

  let group = null
  let groupMembers: any[] = []
  let payments: any[] = []

  if (currentGroup && currentGroup.length > 0) {
    const groupData = currentGroup[0]
    
    // Get full group details
    const { data: fullGroup } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupData.group_id)
      .single()

    if (fullGroup) {
      group = fullGroup

      // Get group member profiles
      const { data: members } = await supabase
        .from('profiles')
        .select('display_name, user_id')
        .in('user_id', group.member_ids)

      groupMembers = members || []

      // Get payment status for all members
      const { data: groupPayments } = await supabase
        .from('payments')
        .select('user_id, status')
        .eq('group_id', group.id)

      payments = groupPayments || []
    }
  }

  return {
    user: userWithEmail,
    profile,
    queueEntry,
    currentGroup: group,
    paymentStatus: null,
    pastGroups: []
  }
}

export default async function HomePage() {
  const data = await getUserData()
  
  return <Dashboard {...data} />
}
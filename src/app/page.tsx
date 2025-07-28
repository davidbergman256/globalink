import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

async function getUserData() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('Home page - user data:', user ? 'User found' : 'No user', user?.email)
  
  // Middleware ensures we have a user here
  if (!user) {
    console.log('Home page - No user, redirecting to login')
    redirect('/login')
  }

  // Check if user has completed profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('Home page - profile check:', profile ? 'Profile found' : 'No profile')

  if (!profile) {
    console.log('Home page - No profile, redirecting to questionnaire')
    redirect('/questionnaire')
  }

  // Get queue status
  const { data: queueEntry } = await supabase
    .from('queue')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get current group
  const { data: currentGroup } = await supabase
    .from('groups')
    .select('*')
    .contains('member_ids', [user.id])
    .in('status', ['forming', 'pending_payment', 'location_revealed'])
    .single()

  // Get payment status for current group
  let paymentStatus = null
  if (currentGroup) {
    const { data: payment } = await supabase
      .from('payments')
      .select('status')
      .eq('group_id', currentGroup.id)
      .eq('user_id', user.id)
      .single()
    
    paymentStatus = payment?.status || 'unpaid'
  }

  // Get past events
  const { data: pastGroups } = await supabase
    .from('groups')
    .select('*')
    .contains('member_ids', [user.id])
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })

  // Check feedback status for completed groups
  let feedbackStatus = []
  if (pastGroups && pastGroups.length > 0) {
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('group_id')
      .eq('user_id', user.id)
    
    feedbackStatus = existingFeedback?.map(f => f.group_id) || []
  }

  return {
    user: {
      id: user.id,
      email: user.email!, // Safe to assert since we checked user exists
      created_at: user.created_at
    },
    profile,
    queueEntry,
    currentGroup,
    paymentStatus,
    pastGroups: pastGroups || [],
    feedbackStatus
  }
}

export default async function HomePage() {
  const data = await getUserData()

  // Show dashboard for authenticated users
  return <Dashboard {...data} />
} 
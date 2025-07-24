import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

async function getUserData() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  return {
    user,
    profile,
    queueEntry,
    currentGroup,
    paymentStatus,
    pastGroups: pastGroups || []
  }
}

export default async function HomePage() {
  const data = await getUserData()

  return <Dashboard {...data} />
} 
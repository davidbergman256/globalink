import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect, notFound } from 'next/navigation'
import GroupDetail from '@/components/GroupDetail'

interface Props {
  params: { id: string }
}

async function getGroupData(groupId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get group details
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) {
    notFound()
  }

  // Check if user is a member of this group
  if (!group.member_ids.includes(user.id)) {
    redirect('/')
  }

  // Get payment status
  const { data: payment } = await supabase
    .from('payments')
    .select('status')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  const paymentStatus = payment?.status || 'unpaid'

  // Get member profiles
  const { data: members } = await supabase
    .from('profiles')
    .select('user_id, display_name, age, personality, pref_activity, from_location')
    .in('user_id', group.member_ids)

  // Get display names for members
  const userEmails = group.member_ids.map(id => {
    const member = members?.find(m => m.user_id === id)
    const displayName = member?.display_name || `User ${id.slice(0, 8)}`
    return { id, email: `${displayName}@globalink.app` }
  })

  // Get RSVP data
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .eq('group_id', groupId)

  return {
    user: {
      id: user.id,
      email: user.email!, // Safe to assert since we checked user exists
      created_at: user.created_at
    },
    group,
    paymentStatus,
    members: members || [],
    userEmails: userEmails || [],
    rsvps: rsvps || []
  }
}

export default async function GroupPage({ params }: Props) {
  const data = await getGroupData(params.id)

  return <GroupDetail {...data} />
} 
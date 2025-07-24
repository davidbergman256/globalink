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
    .select('user_id, age, personality, pref_activity, from_location')
    .in('user_id', group.member_ids)

  // Get member emails from auth.users (for contact purposes)
  const { data: userEmails } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', group.member_ids)

  // Get RSVP data
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .eq('group_id', groupId)

  return {
    user,
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
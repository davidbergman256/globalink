import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect, notFound } from 'next/navigation'
import RSVPPage from '@/components/RSVPPage'

interface Props {
  params: { id: string }
  searchParams: { response?: 'yes' | 'no' }
}

async function getRSVPData(groupId: string, response: 'yes' | 'no' | undefined) {
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

  // Process RSVP if response is provided
  if (response) {
    const { error } = await supabase
      .from('rsvps')
      .upsert({
        group_id: groupId,
        user_id: user.id,
        answer: response
      })

    if (error) {
      console.error('Error saving RSVP:', error)
    }
  }

  // Get existing RSVP
  const { data: existingRsvp } = await supabase
    .from('rsvps')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  return {
    user,
    group,
    existingRsvp,
    response
  }
}

export default async function RSVPHandler({ params, searchParams }: Props) {
  const data = await getRSVPData(params.id, searchParams.response)

  return <RSVPPage {...data} />
} 
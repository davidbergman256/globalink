import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect, notFound } from 'next/navigation'
import FeedbackPage from '@/components/FeedbackPage'

interface Props {
  params: { id: string }
}

async function getFeedbackData(groupId: string) {
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

  // Check if group is completed (feedback should only be available post-event)
  if (group.status !== 'completed') {
    redirect(`/group/${groupId}`)
  }

  // Get existing feedback
  const { data: existingFeedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  return {
    user: {
      id: user.id,
      email: user.email!, // Safe to assert since we checked user exists
      created_at: user.created_at
    },
    group,
    existingFeedback
  }
}

export default async function FeedbackHandler({ params }: Props) {
  const data = await getFeedbackData(params.id)

  return <FeedbackPage {...data} />
} 
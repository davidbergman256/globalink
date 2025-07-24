import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect, notFound } from 'next/navigation'
import PaymentPage from '@/components/PaymentPage'

interface Props {
  params: { id: string }
}

async function getPaymentData(groupId: string) {
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

  // Check if payment already exists
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (existingPayment) {
    // Already paid, redirect to group page
    redirect(`/group/${groupId}`)
  }

  return {
    user,
    group
  }
}

export default async function PaymentHandler({ params }: Props) {
  const data = await getPaymentData(params.id)

  return <PaymentPage {...data} />
} 
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface Props {
  searchParams: { session_id?: string; group_id?: string }
}

async function verifyPayment(sessionId: string, groupId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify payment exists
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .eq('stripe_session_id', sessionId)
    .single()

  return { user, payment }
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id, group_id } = searchParams

  if (!session_id || !group_id) {
    redirect('/')
  }

  const { user, payment } = await verifyPayment(session_id, group_id)

  if (!payment) {
    redirect(`/group/${group_id}`)
  }

  return (
    <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your spot in the group is now secured. You&apos;ll receive location details soon!
          </p>
          
          <div className="bg-[#F9F6EE] p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Details
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Amount:</strong> $8.00 (refundable deposit)</p>
              <p><strong>Status:</strong> Paid</p>
              <p><strong>Payment ID:</strong> {payment.id.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href={`/group/${group_id}`}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#698a7b] hover:bg-[#5a7a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#698a7b]"
            >
              Back to Group Details
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-[#698a7b] rounded-md shadow-sm text-sm font-medium text-[#698a7b] bg-[#F9F6EE] hover:bg-[#F5F2EA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#698a7b]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
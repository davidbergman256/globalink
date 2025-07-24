'use client'

import { useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { CreditCard, Shield, ArrowLeft, AlertCircle } from 'lucide-react'
import type { User, Group } from '@/lib/types'

interface PaymentPageProps {
  user: User
  group: Group
}

export default function PaymentPage({ user, group }: PaymentPageProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Simulate payment for now - replace with actual Stripe integration
  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'paid',
          stripe_session_id: 'mock_session_' + Date.now(),
          amount_cents: 800
        })

      if (paymentError) throw paymentError

      // Update group status to location_revealed if all members have paid
      // For now, we'll just update it immediately for demo purposes
      const { error: groupError } = await supabase
        .from('groups')
        .update({ status: 'location_revealed' })
        .eq('id', group.id)

      if (groupError) throw groupError

      // Redirect to group page
      router.push(`/group/${group.id}`)

    } catch (error: any) {
      console.error('Error processing payment:', error)
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reserve Your Spot
          </h1>
          <p className="text-gray-600">
            $8 refundable deposit to confirm attendance
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Venue</span>
              <p className="text-gray-900">{group.venue_name}</p>
            </div>
            
            {group.event_datetime && (
              <div>
                <span className="text-sm font-medium text-gray-500">Date & Time</span>
                <p className="text-gray-900">{formatDateTime(group.event_datetime)}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-gray-500">Group Size</span>
              <p className="text-gray-900">{group.member_ids.length} members</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Deposit</span>
              <span className="font-semibold text-gray-900">$8.00</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">$8.00</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">100% Refundable</p>
                <p>Get your money back if the event is cancelled or you can't attend.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Integration Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Demo Mode</p>
              <p>This is a simulated payment. In production, this would integrate with Stripe for secure payment processing.</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-purple-600 text-white py-4 px-6 rounded-md font-semibold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Reserve with $8 (refundable)'
          )}
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Security Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure payment processing powered by Stripe</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  )
} 
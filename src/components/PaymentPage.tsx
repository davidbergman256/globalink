'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './SupabaseProvider'
import { CreditCard, Users, Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe'
import type { User, Group, Profile } from '@/lib/types'

interface PaymentPageProps {
  user: User
  group: Group
  members: Partial<Profile>[]
}

export default function PaymentPage({ user, group, members }: PaymentPageProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingPayment, setCheckingPayment] = useState(true)

  // Check payment status on component mount and when user returns from Stripe
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('*')
          .eq('group_id', group.id)
          .eq('user_id', user.id)
          .single()

        if (existingPayment) {
          // Payment found, redirect to group page
          router.push(`/group/${group.id}`)
          return
        }
      } catch (error) {
        console.log('No payment found, staying on payment page')
      } finally {
        setCheckingPayment(false)
      }
    }

    checkPaymentStatus()

    // Also check when the user comes back to the tab (e.g., from Stripe)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkPaymentStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [group.id, user.id, router, supabase])

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC'
    }
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: group.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking payment status
  if (checkingPayment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#698a7b]" />
          <span className="ml-2 text-gray-600">Checking payment status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#698a7b] hover:text-[#5a7a6b] mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to group
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#698a7b] px-6 py-8">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-white mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Secure Your Spot
            </h1>
            <p className="text-green-100">
              $8.00 refundable deposit
            </p>
          </div>
        </div>

        {/* Group Details */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Event Details
          </h2>
          
          <div className="space-y-3">
            {group.event_datetime && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{formatDateTime(group.event_datetime)}</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{group.member_ids.length} members in your event</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Summary
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Meetup deposit</span>
              <span className="font-medium">$8.00</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>$8.00</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * This deposit is fully refundable if you attend the meetup
            </p>
          </div>
        </div>

        {/* Payment Action */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#698a7b] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#5a7a6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay with Stripe
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Secure payment powered by Stripe
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
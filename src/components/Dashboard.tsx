'use client'

import { useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { Users, Calendar, MapPin, CreditCard, Clock, Loader2, AlertCircle } from 'lucide-react'
import type { User, Profile, QueueEntry, Group } from '@/lib/types'

interface DashboardProps {
  user: User
  profile: Profile
  queueEntry: QueueEntry | null
  currentGroup: Group | null
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | null
  pastGroups: Group[]
}

export default function Dashboard({ 
  user, 
  profile, 
  queueEntry, 
  currentGroup, 
  paymentStatus, 
  pastGroups 
}: DashboardProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoinQueue = async () => {
    setLoading(true)
    setError('')

    try {
      // Extract campus from current location (this is a simplified approach)
      const campus = profile.current_location || 'Unknown Campus'

      const { error } = await supabase
        .from('queue')
        .insert({
          user_id: user.id,
          campus: campus
        })

      if (error) throw error

      // Refresh the page to show updated queue status
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveQueue = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('queue')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      forming: { label: 'Forming', color: 'bg-yellow-100 text-yellow-800' },
      pending_payment: { label: 'Payment Required', color: 'bg-red-100 text-red-800' },
      location_revealed: { label: 'Ready', color: 'bg-green-100 text-green-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.forming

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Ready to connect with your crew?
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

      {/* Current Group Card */}
      {currentGroup && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Crew</h2>
            {getStatusBadge(currentGroup.status)}
          </div>

          <div className="space-y-4">
            {currentGroup.event_datetime && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3" />
                <span>{formatDateTime(currentGroup.event_datetime)}</span>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3" />
              <span>{currentGroup.member_ids.length} members</span>
            </div>

            {currentGroup.status === 'location_revealed' && currentGroup.venue_name && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <span>{currentGroup.venue_name}</span>
              </div>
            )}

            {/* Payment Status */}
            {currentGroup.status === 'pending_payment' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Payment Required
                    </p>
                    <p className="text-sm text-yellow-700">
                      Reserve your spot with a $8 refundable deposit
                    </p>
                  </div>
                </div>
                <button 
                  className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                  onClick={() => router.push(`/payment/${currentGroup.id}`)}
                >
                  Reserve with $8 (refundable)
                </button>
              </div>
            )}

            {paymentStatus === 'paid' && currentGroup.status === 'location_revealed' && (
              <button
                onClick={() => router.push(`/group/${currentGroup.id}`)}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      )}

      {/* Queue Status or Join Queue */}
      {!currentGroup && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {queueEntry ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Looking for the other four
              </h2>
              <p className="text-gray-600 mb-6">
                We're finding awesome people for you to meet. This usually takes less than 24 hours.
              </p>
              <button
                onClick={handleLeaveQueue}
                disabled={loading}
                className="text-purple-600 hover:text-purple-500 text-sm font-medium"
              >
                Leave queue
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to meet your crew?
              </h2>
              <p className="text-gray-600 mb-6">
                We'll match you with 4 other students for an amazing experience
              </p>
              <button
                onClick={handleJoinQueue}
                disabled={loading}
                className="bg-purple-600 text-white px-8 py-3 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 inline-flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Find my crew'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {pastGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">History</h2>
          <div className="space-y-4">
            {pastGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      Crew of {group.member_ids.length}
                    </span>
                    {getStatusBadge(group.status)}
                  </div>
                  {group.event_datetime && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(group.event_datetime)}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => router.push(`/group/${group.id}`)}
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {!currentGroup && !queueEntry && pastGroups.length === 0 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your adventure starts here
          </h3>
          <p className="text-gray-600">
            Click "Find my crew" to get matched with other students
          </p>
        </div>
      )}
    </div>
  )
} 
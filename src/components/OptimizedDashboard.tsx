'use client'

import React, { memo } from 'react'
import { Users, Calendar, MapPin, CreditCard, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { User, Profile, Group } from '@/lib/types'

interface QueueStatusProps {
  queueEntry: any
  onJoinQueue: () => void
  onLeaveQueue: () => void
  loading: boolean
  error: string
}

export const QueueStatus = memo(function QueueStatus({ 
  queueEntry, 
  onJoinQueue, 
  onLeaveQueue, 
  loading, 
  error 
}: QueueStatusProps) {
  if (queueEntry) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">You&apos;re in the queue!</h3>
            <p className="text-blue-700 mt-1">We&apos;re finding the perfect crew for you</p>
          </div>
          <button
            onClick={onLeaveQueue}
            disabled={loading}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {loading ? 'Leaving...' : 'Leave Queue'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F5F2EA] border border-gray-200 rounded-lg p-6">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to connect with your crew?
        </h3>
        <p className="text-gray-600 mb-4">
          Join the queue to get matched with other students in your area
        </p>
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}
        <button
          onClick={onJoinQueue}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 bg-[#698a7b] text-white rounded-md hover:bg-[#5a7a6b] font-medium disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Find my crew'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface CurrentGroupProps {
  group: Group
  paymentStatus: string | null
  user: User
}

export const CurrentGroup = memo(function CurrentGroup({ 
  group, 
  paymentStatus, 
  user 
}: CurrentGroupProps) {
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

  return (
    <div className="bg-[#F9F6EE] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-green-50 border-b border-green-200">
        <h2 className="text-xl font-semibold text-gray-900">Your Crew</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {group.event_datetime && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span>{formatDateTime(group.event_datetime)}</span>
            </div>
          )}
          
          {group.status === 'location_revealed' && group.venue_name && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span>{group.venue_name}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-3" />
            <span>{group.member_ids.length} members</span>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href={`/group/${group.id}`}
            className="flex-1 bg-[#698a7b] text-white px-4 py-2 rounded-md hover:bg-[#5a7a6b] text-center font-medium"
          >
            View Details
          </Link>
          
          {group.status === 'pending_payment' && paymentStatus !== 'paid' && (
            <Link
              href={`/payment/${group.id}`}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center font-medium"
            >
              Complete Payment
            </Link>
          )}
        </div>
      </div>
    </div>
  )
})

interface PastGroupsProps {
  pastGroups: Group[]
  feedbackStatus: string[]
}

export const PastGroups = memo(function PastGroups({ 
  pastGroups, 
  feedbackStatus 
}: PastGroupsProps) {
  if (!pastGroups?.length) return null

  return (
    <div className="bg-[#F9F6EE] rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Past Events</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pastGroups.map((group) => {
          const needsFeedback = group.status === 'completed' && !feedbackStatus?.includes(group.id)
          
          return (
            <div key={group.id} className="p-6 hover:bg-[#F5F2EA]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {group.venue_name || `Crew of ${group.member_ids.length}`}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {group.status}
                  </p>
                </div>
                
                {needsFeedback && (
                  <Link
                    href={`/feedback/${group.id}`}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Give Feedback
                  </Link>
                )}
                
                {group.status === 'completed' && feedbackStatus?.includes(group.id) && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Feedback given</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}) 
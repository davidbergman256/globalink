'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react'
import type { User, Group, RSVP } from '@/lib/types'

interface RSVPPageProps {
  user: User
  group: Group
  existingRsvp: RSVP | null
  response?: 'yes' | 'no'
}

export default function RSVPPage({ user, group, existingRsvp, response }: RSVPPageProps) {
  const router = useRouter()

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

  const currentResponse = response || existingRsvp?.answer

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            currentResponse === 'yes' 
              ? 'bg-green-100' 
              : currentResponse === 'no' 
                ? 'bg-red-100' 
                : 'bg-gray-100'
          }`}>
            {currentResponse === 'yes' ? (
              <CheckCircle className="h-10 w-10 text-green-600" />
            ) : currentResponse === 'no' ? (
              <XCircle className="h-10 w-10 text-red-600" />
            ) : (
              <Calendar className="h-10 w-10 text-gray-600" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {currentResponse === 'yes' 
              ? 'Great! See you there!' 
              : currentResponse === 'no' 
                ? 'Thanks for letting us know'
                : 'RSVP for Your Crew'
            }
          </h1>

          {currentResponse === 'yes' && (
            <p className="text-gray-600 mb-8">
              We&apos;re excited to see you at the meetup. You should receive reminder emails before the event.
            </p>
          )}

          {currentResponse === 'no' && (
            <p className="text-gray-600 mb-8">
              We understand things come up. Thanks for letting your crew know in advance.
            </p>
          )}

          {group.event_datetime && group.venue_name && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>{formatDateTime(group.event_datetime)}</span>
                </div>
                
                {group.venue_name && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{group.venue_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!currentResponse && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Will you be able to make it to the meetup?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/rsvp/${group.id}?response=yes`)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700"
                >
                  ✅ I&apos;ll be there
                </button>
                
                <button
                  onClick={() => router.push(`/rsvp/${group.id}?response=no`)}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700"
                >
                  ❌ Can&apos;t make it
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => router.push(`/group/${group.id}`)}
              className="text-[#698a7b] hover:text-[#5a7a6b] font-medium"
            >
              ← Back to group details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Download, 
  Mail, 
  Tag, 
  User as UserIcon,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import type { User, Group, Profile, RSVP } from '@/lib/types'

interface GroupDetailProps {
  user: User
  group: Group
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  members: Partial<Profile>[]
  userEmails: { id: string; email: string }[]
  rsvps: RSVP[]
}

export default function GroupDetail({ 
  user, 
  group, 
  paymentStatus, 
  members,
  userEmails,
  rsvps 
}: GroupDetailProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [sendingReminder, setSendingReminder] = useState(false)

  const canViewLocation = paymentStatus === 'paid' && group.status === 'location_revealed'
  const currentUserRsvp = rsvps.find(r => r.user_id === user.id)

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    const fullOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC'
    }
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: 'UTC'
    }
    return {
      full: new Intl.DateTimeFormat('en-US', fullOptions).format(date),
      date: new Intl.DateTimeFormat('en-US', dateOptions).format(date),
      time: new Intl.DateTimeFormat('en-US', timeOptions).format(date)
    }
  }

  const generateCalendarFile = () => {
    if (!group.event_datetime || !group.venue_name) return

    const startDate = new Date(group.event_datetime)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Globalink//Event//EN',
      'BEGIN:VEVENT',
      `UID:${group.id}@globalink.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Globalink Crew Meetup`,
      `DESCRIPTION:Meet your crew at ${group.venue_name}`,
      `LOCATION:${group.venue_address || group.venue_name}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'crew-meetup.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  const sendReminderEmail = async () => {
    setSendingReminder(true)
    try {
      // Call Supabase Edge Function to send reminder
      const { error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          email: user.email,
          groupId: group.id,
          venueName: group.venue_name,
          venueAddress: group.venue_address,
          eventDateTime: group.event_datetime
        }
      })
      
      if (error) throw error
      alert('Reminder email sent!')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder email')
    } finally {
      setSendingReminder(false)
    }
  }

  const getSharedTags = () => {
    // This is a simplified version - in reality you'd implement proper tag matching
    const allTags = members.flatMap(m => m.tags || [])
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(tagCounts)
      .filter(([_, count]) => count >= 2)
      .map(([tag, _]) => tag)
      .slice(0, 3)
  }

  const sharedTags = getSharedTags()

  const getRsvpStatus = (userId: string) => {
    const rsvp = rsvps.find(r => r.user_id === userId)
    if (!rsvp) return 'pending'
    return rsvp.answer
  }

  if (!canViewLocation && group.status === 'location_revealed') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Payment Required
          </h2>
          <p className="text-yellow-800 mb-6">
            Complete your $8 refundable deposit to see the meetup location and details.
          </p>
          <button
            onClick={() => router.push(`/payment/${group.id}`)}
            className="bg-yellow-600 text-white px-6 py-3 rounded-md font-medium hover:bg-yellow-700"
          >
            Reserve with $8 (refundable)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You&apos;re set!
        </h1>
        <p className="text-gray-600">
          Your crew is ready to meet
        </p>
      </div>

      {/* Location Card */}
      {canViewLocation && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {group.venue_name}
            </h2>
            
            {group.venue_address && (
              <p className="text-gray-600 mb-6">
                {group.venue_address}
              </p>
            )}

            {group.event_datetime && (
                          <div className="bg-green-50 border border-[#698a7b] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-[#4a6256]">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {formatDateTime(group.event_datetime).full}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={generateCalendarFile}
                className="inline-flex items-center px-4 py-2 bg-[#698a7b] text-white rounded-md hover:bg-[#5a7a6b]"
              >
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </button>
              
              <button
                onClick={sendReminderEmail}
                disabled={sendingReminder}
                className="inline-flex items-center px-4 py-2 border border-[#698a7b] text-[#698a7b] rounded-md hover:bg-green-50 disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingReminder ? 'Sending...' : 'Add reminder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Interests */}
      {sharedTags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            What you have in common
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {sharedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-[#4a6256]"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Crew Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Crew ({members.length} members)
        </h3>
        <div className="space-y-4">
          {members.map((member) => {
            const memberEmail = userEmails.find(e => e.id === member.user_id)
            const rsvpStatus = getRsvpStatus(member.user_id!)
            const isCurrentUser = member.user_id === user.id
            
            return (
              <div key={member.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-[#698a7b]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {isCurrentUser ? 'You' : `${memberEmail?.email?.split('@')[0] || member.user_id?.slice(0, 8)}`}
                        {member.age && ` (${member.age})`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {member.personality && (
                        <span className="text-xs text-gray-500">
                                                     {member.personality === 'somewhere_in_between'
                             ? 'Somewhere in between'
                             : member.personality === 'shy_at_first'
                             ? 'Shy at first'
                             : member.personality.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                           }
                        </span>
                      )}
                      {member.from_location && (
                        <span className="text-xs text-gray-500">
                          From {member.from_location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* RSVP Status */}
                <div className="flex items-center">
                  {rsvpStatus === 'yes' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Going</span>
                    </div>
                  )}
                  {rsvpStatus === 'no' && (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Can&apos;t make it</span>
                    </div>
                  )}
                  {rsvpStatus === 'pending' && (
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-xs">Pending</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RSVP Section */}
      {group.event_datetime && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Will you be there?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push(`/rsvp/${group.id}?response=yes`)}
              className={`px-6 py-3 rounded-md font-medium ${
                currentUserRsvp?.answer === 'yes'
                  ? 'bg-green-600 text-white'
                  : 'border border-green-600 text-green-600 hover:bg-green-50'
              }`}
            >
              ✅ I&apos;ll be there
            </button>
            <button
              onClick={() => router.push(`/rsvp/${group.id}?response=no`)}
              className={`px-6 py-3 rounded-md font-medium ${
                currentUserRsvp?.answer === 'no'
                  ? 'bg-red-600 text-white'
                  : 'border border-red-600 text-red-600 hover:bg-red-50'
              }`}
            >
              ❌ Can&apos;t make it
            </button>
          </div>
          {currentUserRsvp && (
            <p className="text-center text-sm text-gray-600 mt-4">
              You responded: {currentUserRsvp.answer === 'yes' ? "I'll be there" : "Can't make it"}
            </p>
          )}
        </div>
      )}
    </div>
  )
} 
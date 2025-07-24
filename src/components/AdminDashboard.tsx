'use client'

import { useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock,
  Settings,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import type { User, QueueEntry, Group, Profile } from '@/lib/types'

interface AdminDashboardProps {
  user: User
  queueEntries: QueueEntry[]
  profiles: Profile[]
  activeGroups: Group[]
}

export default function AdminDashboard({ 
  user, 
  queueEntries, 
  profiles,
  activeGroups 
}: AdminDashboardProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [groupForm, setGroupForm] = useState({
    event_datetime: '',
    venue_name: '',
    venue_address: '',
    campus: ''
  })

  // Get profile for a user
  const getUserProfile = (userId: string) => {
    return profiles.find(p => p.user_id === userId)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else if (prev.length < 5) {
        return [...prev, userId]
      }
      return prev
    })
  }

  const createGroup = async () => {
    if (selectedUsers.length < 2) {
      alert('Please select at least 2 users')
      return
    }

    if (!groupForm.event_datetime || !groupForm.venue_name || !groupForm.campus) {
      alert('Please fill in all required fields')
      return
    }

    setCreating(true)

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          status: 'pending_payment',
          event_datetime: groupForm.event_datetime,
          venue_name: groupForm.venue_name,
          venue_address: groupForm.venue_address,
          campus: groupForm.campus,
          member_ids: selectedUsers
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Remove users from queue
      const { error: queueError } = await supabase
        .from('queue')
        .delete()
        .in('user_id', selectedUsers)

      if (queueError) throw queueError

      // Send match reveal emails (placeholder - would implement with edge function)
      console.log('Would send match reveal emails to:', selectedUsers)

      // Reset form
      setSelectedUsers([])
      setGroupForm({
        event_datetime: '',
        venue_name: '',
        venue_address: '',
        campus: ''
      })

      alert(`Group created successfully! Group ID: ${group.id}`)
      router.refresh()

    } catch (error: any) {
      console.error('Error creating group:', error)
      alert('Failed to create group: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const updateGroupStatus = async (groupId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ status: newStatus })
        .eq('id', groupId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error updating group:', error)
      alert('Failed to update group status')
    }
  }

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manual group creation and queue management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Queue Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Queue ({queueEntries.length} users)
            </h2>
            <Users className="h-6 w-6 text-purple-600" />
          </div>

          {queueEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No users in queue
            </p>
          ) : (
            <div className="space-y-3">
              {queueEntries.map((entry) => {
                const profile = getUserProfile(entry.user_id)
                const isSelected = selectedUsers.includes(entry.user_id)
                
                return (
                  <div
                    key={entry.user_id}
                    onClick={() => handleUserSelect(entry.user_id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            User {entry.user_id.slice(0, 8)}
                          </span>
                          {profile?.age && (
                            <span className="text-sm text-gray-500">
                              ({profile.age})
                            </span>
                          )}
                          {isSelected && (
                            <UserCheck className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{profile?.current_location || 'Unknown location'}</span>
                          {profile?.personality && (
                            <span className="ml-2 capitalize">
                              • {profile.personality.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined: {formatDateTime(entry.joined_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 font-medium">
                {selectedUsers.length} users selected
              </p>
              <p className="text-purple-600 text-sm">
                Click "Create Group" to form a crew
              </p>
            </div>
          )}
        </div>

        {/* Group Creation Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Group
            </h2>
            <Plus className="h-6 w-6 text-purple-600" />
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                value={groupForm.event_datetime}
                onChange={(e) => setGroupForm(prev => ({ ...prev, event_datetime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. Brooklyn Boulders"
                value={groupForm.venue_name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, venue_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Address
              </label>
              <input
                type="text"
                placeholder="Full address"
                value={groupForm.venue_address}
                onChange={(e) => setGroupForm(prev => ({ ...prev, venue_address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus
              </label>
              <input
                type="text"
                placeholder="e.g. Boston, MA"
                value={groupForm.campus}
                onChange={(e) => setGroupForm(prev => ({ ...prev, campus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={createGroup}
              disabled={creating || selectedUsers.length === 0}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : `Create Group (${selectedUsers.length} users)`}
            </button>
          </form>
        </div>
      </div>

      {/* Active Groups */}
      {activeGroups.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Active Groups ({activeGroups.length})
          </h2>
          <div className="space-y-4">
            {activeGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {group.venue_name || 'Unnamed Group'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        group.status === 'forming' ? 'bg-yellow-100 text-yellow-800' :
                        group.status === 'pending_payment' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {group.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {group.member_ids.length} members • {group.campus}
                      {group.event_datetime && (
                        <span className="ml-2">
                          • {formatDateTime(group.event_datetime)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-x-2">
                    {group.status === 'pending_payment' && (
                      <button
                        onClick={() => updateGroupStatus(group.id, 'location_revealed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Reveal Location
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/group/${group.id}`)}
                      className="px-3 py-1 border border-purple-600 text-purple-600 text-sm rounded hover:bg-purple-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
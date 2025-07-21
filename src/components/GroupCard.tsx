import Link from 'next/link'
import { User } from 'lucide-react'
import Image from 'next/image'
import type { Profile } from '@/lib/types'

type GroupCardProps = {
  profile: Profile
}

export default function GroupCard({ profile }: GroupCardProps) {
  return (
    <Link 
      href={`/members/${profile.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {profile.avatar_url ? (
            <Image
              className="h-12 w-12 rounded-full object-cover"
              src={profile.avatar_url}
              alt={profile.display_name || 'User'}
              width={48}
              height={48}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {profile.display_name || 'Anonymous'}
          </p>
          {profile.location && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              📍 {profile.location}
            </p>
          )}
          {profile.talk_for_hours && (
            <p className="text-sm text-purple-600 dark:text-purple-400 truncate">
              💬 {profile.talk_for_hours}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
} 
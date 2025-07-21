'use client'

import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LogOut, Menu, X, ExternalLink } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              globalink
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Home
                </Link>
                                <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Profile
                </Link>
                <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Settings
                </Link>
                <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Contact
                </Link>
                <a 
                  href="https://discord.gg/mX57EEm3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  Discord <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Home</Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Profile</Link>
              <Link href="/settings" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Settings</Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Contact</Link>
              <a 
                href="https://discord.gg/mX57EEm3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300"
              >
                Discord
              </a>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
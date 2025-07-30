'use client'

import { useSupabase } from './SupabaseProvider'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Only listen to auth state changes instead of fetching user each time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Get initial user state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getLinkClassName = (path: string) => {
    const baseClasses = "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    const activeClasses = "text-[#698a7b] dark:text-[#698a7b] font-semibold"
    return pathname === path ? `${baseClasses} ${activeClasses}` : baseClasses
  }

  return (
    <nav className="bg-[#F9F6EE] dark:bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png?v=3" 
                alt="Globalink" 
                width={120} 
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className={getLinkClassName('/')}>
                  Home
                </Link>
                <Link href="/contact" className={getLinkClassName('/contact')}>
                  Contact
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${getLinkClassName('/')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${getLinkClassName('/contact')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  handleSignOut()
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
import type { Metadata } from 'next'
import { Inter, Outfit, Poppins } from 'next/font/google'
import './globals.css'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'GLOBALINK',
  description: 'Get matched with student strangers to meet up over lunch, game night, or ceramics class. Find your circle today!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.variable} ${outfit.variable} ${poppins.variable} font-sans`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
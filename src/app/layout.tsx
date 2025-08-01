import type { Metadata } from 'next'
// Using system fonts - no Google Fonts needed
import './globals.css'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Clean system fonts - no setup needed

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
      <body className="font-sans">
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
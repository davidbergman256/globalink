import type { Metadata } from 'next'
// Using self-hosted TTF fonts
import './globals.css'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Custom TTF fonts loaded via CSS

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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="font-inter">
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
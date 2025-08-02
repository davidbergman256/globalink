import './globals.css'
import type { Metadata } from 'next'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'GLOBALINK',
  description: 'Connect with students worldwide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="32x32" />
        <link rel="icon" href="/favicon.ico?v=3" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <meta name="theme-color" content="#3B001B" />
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
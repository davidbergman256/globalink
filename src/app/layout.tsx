import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GLOBALINK - Connect Globally, Belong Locally',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chicle&family=Orelega+One&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
import type { Metadata } from 'next'
import { Inter, Chicle, Orelega_One } from 'next/font/google'
import './globals.css'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const chicle = Chicle({ 
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-chicle'
})

const orelegaOne = Orelega_One({ 
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-orelega'
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
      <body className={`${inter.variable} ${chicle.variable} ${orelegaOne.variable} ${inter.className}`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
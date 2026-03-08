import { Geist, Geist_Mono } from 'next/font/google'
import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'

import { cn } from '@/utils/mergeClass'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export { metadata } from '@/features/metadata/constants'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable)}>
        {children}
        <SpeedInsights />
        <Analytics />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}

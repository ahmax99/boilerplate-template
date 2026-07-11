import { Geist, Geist_Mono } from 'next/font/google'
import '../styles/globals.css'
import { connection } from 'next/server'
import { Suspense } from 'react'
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

export { generateMetadata } from '@/features/metadata/constants'

// Signals that generateMetadata's runtime BASE_URL dependency is intentional,
// so routes with no other dynamic need (e.g. /_not-found) can still
// prerender their content while metadata resolves separately.
// https://nextjs.org/docs/messages/next-prerender-dynamic-metadata
const Connection = async () => {
  await connection()
  return null
}

const DynamicMarker = () => (
  <Suspense>
    <Connection />
  </Suspense>
)

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable)}>
        {children}
        <Toaster position="bottom-right" richColors />
        <DynamicMarker />
      </body>
    </html>
  )
}

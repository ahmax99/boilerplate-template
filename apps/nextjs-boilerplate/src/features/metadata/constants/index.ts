import type { Metadata } from 'next'

import { env } from '@/config/env'

const METADATA = {
  TITLE: 'Next.js Boilerplate',
  DESCRIPTION: 'A production-ready Next.js boilerplate',
  BASE_URL: env.NEXT_PUBLIC_BASE_URL,
  OGP_IMAGE: `${env.NEXT_PUBLIC_BASE_URL}/ogp/og-image.jpg`
} as const

export const metadata: Metadata = {
  title: METADATA.TITLE,
  description: METADATA.DESCRIPTION,
  metadataBase: new URL(METADATA.BASE_URL),
  openGraph: {
    title: METADATA.TITLE,
    description: METADATA.DESCRIPTION,
    siteName: METADATA.TITLE,
    url: METADATA.BASE_URL,
    images: [
      {
        url: METADATA.OGP_IMAGE,
        width: 1200,
        height: 630,
        alt: METADATA.TITLE
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: METADATA.TITLE,
    description: METADATA.DESCRIPTION,
    images: [METADATA.OGP_IMAGE]
  }
}

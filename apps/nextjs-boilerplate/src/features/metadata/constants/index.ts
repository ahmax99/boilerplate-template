import { connection } from 'next/server'
import type { Metadata } from 'next'

import { env } from '@/config/env'

const TITLE = 'Next.js Boilerplate'
const DESCRIPTION = 'A production-ready Next.js boilerplate'

export const generateMetadata = async (): Promise<Metadata> => {
  await connection()

  const baseUrl = env.BASE_URL
  const ogpImage = `${baseUrl}/ogp/og-image.jpg`

  return {
    title: TITLE,
    description: DESCRIPTION,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: TITLE,
      url: baseUrl,
      images: [
        {
          url: ogpImage,
          width: 1200,
          height: 630,
          alt: TITLE
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: [ogpImage]
    }
  }
}

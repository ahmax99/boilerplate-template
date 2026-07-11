import type { Metadata } from 'next'

import { generateMetadata as generateBaseMetadata } from '../constants'

interface GeneratePageMetadataProps {
  title?: string
  description?: string
  urlPath?: string
}

export const generatePageMetadata = async ({
  title,
  description,
  urlPath
}: GeneratePageMetadataProps): Promise<Metadata> => {
  const base = await generateBaseMetadata()

  const pageTitle = title ? `${title} | ${base.title}` : base.title
  const pageDescription = description ?? base.description ?? undefined
  const pageUrl = urlPath
    ? `${base.metadataBase?.toString()}${urlPath}`
    : base.metadataBase?.toString()

  return {
    ...base,
    title: String(pageTitle),
    description: pageDescription,
    openGraph: {
      ...base.openGraph,
      title: String(pageTitle),
      description: pageDescription,
      url: pageUrl
    },
    twitter: {
      ...base.twitter,
      title: String(pageTitle),
      description: pageDescription
    }
  }
}

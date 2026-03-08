import type { Metadata } from 'next'

import { metadata } from '../constants'

interface GeneratePageMetadataProps {
  title?: string
  description?: string
  urlPath?: string
}

export const generatePageMetadata = ({
  title,
  description,
  urlPath
}: GeneratePageMetadataProps): Metadata => {
  const pageTitle = title ? `${title} | ${metadata.title}` : metadata.title
  const pageDescription = description ?? metadata.description ?? undefined
  const pageUrl = urlPath
    ? `${metadata.metadataBase?.toString()}${urlPath}`
    : metadata.metadataBase?.toString()

  return {
    ...metadata,
    title: String(pageTitle),
    description: pageDescription,
    openGraph: {
      ...metadata.openGraph,
      title: String(pageTitle),
      description: pageDescription,
      url: pageUrl
    },
    twitter: {
      ...metadata.twitter,
      title: String(pageTitle),
      description: pageDescription
    }
  }
}

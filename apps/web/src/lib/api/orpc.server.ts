import 'server-only'

import { headers } from 'next/headers'
import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { appContract } from '@repo/contract'

import { env } from '@/config/env'
import type { ORPCClient } from '@/types/orpc'

const link = new OpenAPILink(appContract, {
  url: env.NEXT_PUBLIC_API_URL,
  headers: async () => {
    const headersList = await headers()
    return {
      'Content-Type': 'application/json',
      cookie: headersList.get('cookie') ?? ''
    }
  }
})

const client: ORPCClient = createORPCClient(link)

globalThis.$orpcServer = client

export const orpcServer = client

import 'server-only'

import { headers } from 'next/headers'
import { createServerClient, type ORPCClient } from '@repo/contract'

import { env } from '@/config/env'

const client: ORPCClient = createServerClient({
  url: env.API_URL,
  headers: async () => {
    const headersList = await headers()
    return {
      'Content-Type': 'application/json',
      cookie: headersList.get('cookie') ?? '',
      authorization: headersList.get('authorization') ?? ''
    }
  }
})

// The unified client (lib/api/orpc.client.ts) uses this during SSR and falls back to the browser OpenAPI client on the client.
globalThis.$client = client

export const orpcServer: ORPCClient = client

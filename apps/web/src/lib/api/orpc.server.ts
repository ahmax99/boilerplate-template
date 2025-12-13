import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient, type ORPCClient } from '@repo/contract'

import { env } from '@/config/env'

const client: ORPCClient = createServerClient({
  url: env.API_URL,
  headers: async () => {
    const cookieStore = await cookies()

    return {
      'Content-Type': 'application/json',
      cookie: cookieStore.toString()
    }
  }
})

// The unified client (lib/api/orpc.client.ts) uses this during SSR and falls back to the browser OpenAPI client on the client.
globalThis.$client = client

export const orpcServer: ORPCClient = client

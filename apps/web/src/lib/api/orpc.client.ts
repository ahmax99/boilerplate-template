import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { createBrowserClient, type ORPCClient } from '@repo/contract'

import { env } from '@/config/env'

const browserClient: ORPCClient = createBrowserClient({
  url: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const baseClient = globalThis.$client ?? browserClient

export const orpcClient = createTanstackQueryUtils(baseClient)

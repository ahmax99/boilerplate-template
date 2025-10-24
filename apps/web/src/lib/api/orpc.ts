import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { appContract } from '@repo/contract'

import { env } from '@/config/env'

import type { ORPCClient } from '../../types/orpc'

const link = new OpenAPILink(appContract, {
  url: () => {
    if (globalThis.window === undefined)
      throw new TypeError('OpenAPILink not allowed on server side')

    return env.NEXT_PUBLIC_API_URL
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

const browserClient: ORPCClient = createORPCClient(link)

const baseClient = globalThis.$orpcServer ?? browserClient

export const orpcClient = createTanstackQueryUtils(baseClient)

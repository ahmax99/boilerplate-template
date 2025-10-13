import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { orpcClientInstance } from '@repo/contract'

import { env } from '@/config/env'

const clientSideOrpcClient = orpcClientInstance(env.NEXT_PUBLIC_API_URL, {
  'Content-Type': 'application/json'
})

export const orpcClient = createTanstackQueryUtils(clientSideOrpcClient)

import { passkeyClient } from '@better-auth/passkey/client'
import {
  adminClient,
  organizationClient,
  twoFactorClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from '@/config/env'
import { ac, admin, user } from '@/features/auth/lib/permissions'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  basePath: '/api/auth',
  plugins: [
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        globalThis.location.href = '/auth/2fa'
      }
    }),
    adminClient({
      ac,
      roles: {
        admin,
        user
      }
    }),
    organizationClient()
  ]
})

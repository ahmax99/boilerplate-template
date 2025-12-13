import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from '@/config/env'

import { ac, admin, user } from './permissions'

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/auth`,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user
      }
    }),
    organizationClient()
  ],
  fetchOptions: {
    credentials: 'include',
    onError: (context) =>
      console.error('Auth request failed:', {
        status: context.response?.status,
        message: context.error?.message
      })
  }
})

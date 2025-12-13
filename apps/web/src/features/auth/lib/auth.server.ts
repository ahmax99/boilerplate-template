import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'

import { env } from '@/config/env'

import { ac, admin as adminRole, user } from './permissions'

export const authServer = betterAuth({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  basePath: '/api/auth',
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        user
      }
    }),
    organization()
  ]
})

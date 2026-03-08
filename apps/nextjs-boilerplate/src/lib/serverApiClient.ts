import 'server-only'

import ky from 'ky'

import { env } from '@/config/env'
import { getTokens } from '@/features/auth/server/services/token'
import { AppError } from '@/features/error/lib/AppError'

import { signingHook } from './sig4'

export const serverApiClient = ky.create({
  prefix: env.BACKEND_INTERNAL_URL,
  timeout: 10000,
  credentials: 'include',
  cache: 'no-store',
  retry: {
    limit: 3,
    methods: ['get'],
    statusCodes: [408, 429, 500, 502, 503, 504],
    backoffLimit: 5000
  },
  hooks: {
    beforeRequest: [...(env.NODE_ENV === 'production' ? [signingHook] : [])]
  }
})

export const serverAuthApiClient = serverApiClient.extend({
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { idToken } = await getTokens()

        request.headers.set('Authorization', `Bearer ${idToken}`)
      }
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) throw new AppError('UNAUTHORIZED')
      }
    ]
  }
})

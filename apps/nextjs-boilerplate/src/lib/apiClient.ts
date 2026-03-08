import ky from 'ky'

import { env } from '@/config/env'
import { getTokens } from '@/features/auth/server/services/token'
import { AppError } from '@/features/error/lib/AppError'

export const apiClient = ky.create({
  prefix: '/api/',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

export const serverApiClient = ky.create({
  prefix: env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
  credentials: 'include',
  cache: 'no-store',
  retry: {
    limit: 3,
    methods: ['get'],
    statusCodes: [408, 429, 500, 502, 503, 504],
    backoffLimit: 5000
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

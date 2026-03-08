import { env } from '@/config/env'

export const SESSION_CONFIG = {
  EXPIRES_IN: 60 * 60 * 24 * 7, // 7 days
  UPDATE_AGE: 60 * 60 * 24, // 1 day
  COOKIE_CACHE_MAX_AGE: 5 * 60, // 5 minutes
  COOKIE_CACHE_ENABLED: env.NODE_ENV === 'production'
} as const

import type { SessionOptions } from 'iron-session'

import { env } from '@/config/env'

import { COOKIE_OPTIONS } from './cookie'

export const SESSION_CONFIG = {
  password: env.SESSION_SECRET,
  cookieName: 'auth_session',
  cookieOptions: COOKIE_OPTIONS
} as SessionOptions

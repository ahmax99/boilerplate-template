import type { BetterAuthOptions } from 'better-auth'

/**
 * Cookie and session security configuration based on OWASP best practices
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
 */

const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR

export const SESSION_CONFIG: NonNullable<BetterAuthOptions['session']> = {
  expiresIn: 30 * SECONDS_IN_DAY,
  updateAge: 1 * SECONDS_IN_DAY,
  cookieCache: {
    enabled: true,
    maxAge: 5 * SECONDS_IN_MINUTE
  }
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * SECONDS_IN_DAY,
  domain: undefined,
  path: '/'
}

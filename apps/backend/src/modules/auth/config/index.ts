import { prisma } from '@repo/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'

import type { Env } from '../../../config/env'
import { COOKIE_OPTIONS, SESSION_CONFIG } from '../constants/session'

export const AUTH_INSTANCE = Symbol('AUTH_INSTANCE')

export const createAuth = (env: Env) =>
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql'
    }),
    emailAndPassword: {
      enabled: true
    },
    socialProviders: {
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret
      },
      github: {
        clientId: env.githubClientId,
        clientSecret: env.githubClientSecret
      }
    },
    plugins: [admin(), organization(), openAPI()],
    trustedOrigins: [env.webUrl],
    baseURL: env.baseUrl,
    basePath: '/api/auth',
    secret: env.betterAuthSecret,
    session: SESSION_CONFIG,
    advanced: {
      disableCSRFCheck: env.nodeEnv === 'development',
      disableOriginCheck: env.nodeEnv === 'development',
      cookieOptions: COOKIE_OPTIONS
    },
    hooks: {}
  })

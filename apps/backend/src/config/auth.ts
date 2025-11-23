import { passkey } from '@better-auth/passkey'
import { prisma } from '@repo/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'
import { twoFactor } from 'better-auth/plugins/two-factor'

import { Env } from './env'

const env = new Env()

export const auth: ReturnType<typeof betterAuth> = betterAuth({
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
  plugins: [passkey(), twoFactor(), admin(), organization()],
  trustedOrigins: [env.webUrl ?? 'http://localhost:3000'],
  baseURL: env.baseUrl,
  basePath: '/api/auth',
  secret: env.betterAuthSecret,
  hooks: {} // Required for using @Hook decorators
})

export type Auth = typeof auth

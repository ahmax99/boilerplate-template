import { prisma } from '@repo/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:3000'],
  baseURL: process.env.BASE_URL,
  basePath: '/api/auth',
  hooks: {} // Required for using @Hook decorators
})

export type Auth = typeof auth

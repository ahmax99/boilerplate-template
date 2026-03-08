import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_BACKEND_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url()
  },
  server: {
    AWS_REGION: z.string().min(1).default('ap-northeast-1'),
    COGNITO_CLIENT_ID: z.string().min(1).default('dummy-client-id'),
    COGNITO_DOMAIN: z.string().min(1).default('dummy-domain'),
    COGNITO_USERPOOL_ID: z.string().min(1).default('dummy-userpool-id'),
    CONTACT_TO_EMAIL: z.email().default('noreply@example.com'),
    FROM_EMAIL: z.email().default('noreply@example.com'),
    NODE_ENV: z.enum(['development', 'production']).default('production'),
    RESEND_API_KEY: z.string().min(1).default('dummy-key'),
    SESSION_SECRET: z.string().min(1).default('dummy-secret')
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true
})

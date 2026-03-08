import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_BACKEND_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url()
  },
  server: {
    AWS_REGION: z.string().min(1),
    COGNITO_CLIENT_ID: z.string().min(1),
    COGNITO_CLIENT_SECRET: z.string().min(1),
    COGNITO_DOMAIN: z.string().min(1),
    COGNITO_USERPOOL_ID: z.string().min(1),
    CONTACT_TO_EMAIL: z.email(),
    FROM_EMAIL: z.email(),
    NODE_ENV: z.enum(['development', 'production']),
    RESEND_API_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1)
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    AWS_REGION: process.env.AWS_REGION,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
    COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
    COGNITO_USERPOOL_ID: process.env.COGNITO_USERPOOL_ID,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    FROM_EMAIL: process.env.FROM_EMAIL,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.VERCEL_ENV === 'production',
  emptyStringAsUndefined: true
})

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    AWS_REGION: z.string().min(1),
    AWS_LWA_PORT: z.string().min(1),
    FRONTEND_URL: z.url(),
    S3_BUCKET_NAME: z.string().min(1),
    SENTRY_DSN: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

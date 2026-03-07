import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    BACKEND_BASE_URL: z.url().transform((url) => {
      const urlObj = new URL(url)
      return { url, port: Number.parseInt(urlObj.port, 10) }
    }),
    AWS_REGION: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1)
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

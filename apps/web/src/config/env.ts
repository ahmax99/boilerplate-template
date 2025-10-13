import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().min(1)
  },
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production'])
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV
  }
})

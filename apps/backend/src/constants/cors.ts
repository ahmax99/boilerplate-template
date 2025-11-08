import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

import type { Env } from '../config/env'

export const getCorsConfig = (env: Env): CorsOptions => ({
  origin: env.webUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

import * as Sentry from '@sentry/nextjs'

import { logger } from './config/logger'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./features/error-tracking/config/sentry.server.config')

    logger.info('Server logger initialised')
  }

  if (process.env.NEXT_RUNTIME === 'edge')
    await import('./features/error-tracking/config/sentry.edge.config')
}

export const onRequestError = Sentry.captureRequestError

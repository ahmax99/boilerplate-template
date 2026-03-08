import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs')
    await import('./features/error-tracking/config/sentry.server.config')

  if (process.env.NEXT_RUNTIME === 'edge')
    await import('./features/error-tracking/config/sentry.edge.config')
}

export const onRequestError = Sentry.captureRequestError

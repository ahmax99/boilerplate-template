import { ForbiddenError } from '@casl/ability'
import { Result, ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger'
import { captureError } from '@/features/error-tracking/utils/captureError'

import { AppError } from '../lib/AppError'

const log = logger.child({ module: 'catchError' })

const stringifyUnknownError = (error: unknown) => {
  switch (typeof error) {
    case 'string':
      return error
    case 'object':
      if (error === null) return 'null'
      return JSON.stringify(error)
    default:
      return String(error)
  }
}

export const mapToAppError = (error: unknown) => {
  switch (true) {
    case error instanceof AppError:
      return error
    case error instanceof ForbiddenError:
      return new AppError('FORBIDDEN', error.message)
    case error instanceof Error:
      return new AppError('INTERNAL_ERROR', error.message)
    default:
      return new AppError('INTERNAL_ERROR', stringifyUnknownError(error))
  }
}

export const catchSyncError = <T>(fn: () => T) =>
  Result.fromThrowable(fn, mapToAppError)().mapErr((error) => {
    log.error({ code: error.code, msg: error.message }, 'Sync error caught')
    captureError(error)
    return error
  })

export const catchAsyncError = <T>(promise: Promise<T>) =>
  ResultAsync.fromPromise(promise, mapToAppError).mapErr((error) => {
    log.error({ code: error.code, msg: error.message }, 'Async error caught')
    captureError(error)
    return error
  })

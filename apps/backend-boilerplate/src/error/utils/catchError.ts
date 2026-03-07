import { ForbiddenError } from '@casl/ability'
import { Result, ResultAsync } from 'neverthrow'

import { AppError } from '../lib/AppError.js'
import { captureError } from './captureError.js'

const stringifyUnknownError = (error: unknown) => {
  switch (typeof error) {
    case 'string':
      return error
    case 'object':
      return error === null ? String(error) : JSON.stringify(error)
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
    captureError(error)
    return error
  })

export const catchAsyncError = <T>(promise: Promise<T>) =>
  ResultAsync.fromPromise(promise, mapToAppError).mapErr((error) => {
    captureError(error)
    return error
  })

import { Elysia } from 'elysia'

import { captureError } from '../utils/captureError.js'
import { mapToAppError } from '../utils/catchError.js'
import { AppError } from './AppError.js'

export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({ AppError })
  .onError(({ error }) => {
    if (error instanceof AppError) return error.toResponse()

    captureError(error as Error)
    return mapToAppError(error).toResponse()
  })

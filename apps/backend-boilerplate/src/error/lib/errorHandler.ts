import { Elysia } from 'elysia'

import { logger } from '../../config/logger.js'
import { captureError } from '../utils/captureError.js'
import { mapToAppError } from '../utils/catchError.js'
import { AppError } from './AppError.js'

export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({ AppError })
  .onError(({ error, request, path }) => {
    if (error instanceof AppError) {
      logger.warn({
        msg: 'Application error',
        error: {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code
        },
        path,
        method: request.method
      })
      return error.toResponse()
    }

    captureError(error as Error)
    return mapToAppError(error).toResponse()
  })

import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { sanitizeData } from '../utils/sanitizeData.util'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const { method, url, body, query, params } = request
    const userAgent = request.get('user-agent') || ''
    const ip = request.ip

    const now = Date.now()

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
    )

    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = sanitizeData(body)
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`)
    }

    if (query && Object.keys(query).length > 0) {
      const sanitizedQuery = sanitizeData(query)
      this.logger.debug(`Query Params: ${JSON.stringify(sanitizedQuery)}`)
    }

    if (params && Object.keys(params).length > 0) {
      const sanitizedParams = sanitizeData(params)
      this.logger.debug(`Route Params: ${JSON.stringify(sanitizedParams)}`)
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const delay = Date.now() - now
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms`
          )

          if (data && typeof data === 'object') {
            const sanitizedData = sanitizeData(data)
            this.logger.debug(`Response Data: ${JSON.stringify(sanitizedData)}`)
          }
        },
        error: (error) => {
          const delay = Date.now() - now
          this.logger.error(
            `Error Response: ${method} ${url} ${error.status || 500} - ${delay}ms`
          )
          this.logger.error(`Error Message: ${error.message}`)

          if (error.stack) this.logger.debug(`Error Stack: ${error.stack}`)
        }
      })
    )
  }
}

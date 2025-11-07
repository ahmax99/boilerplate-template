import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

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

    if (body && Object.keys(body).length > 0)
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`)

    if (query && Object.keys(query).length > 0)
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`)

    if (params && Object.keys(params).length > 0)
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`)

    return next.handle().pipe(
      tap({
        next: (data) => {
          const delay = Date.now() - now
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms`
          )

          if (data && typeof data === 'object')
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`)
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

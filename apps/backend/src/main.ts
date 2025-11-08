import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { Env } from './config/env'
import { setupSwagger } from './config/swagger'
import { getCorsConfig } from './constants'
import { LoggingInterceptor } from './shared/interceptors'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const env = app.get(Env)

  app.enableCors(getCorsConfig(env))

  app.setGlobalPrefix('api')

  // biome-ignore lint/correctness/useHookAtTopLevel: this is a NestJS method, not a React hook
  app.useGlobalInterceptors(new LoggingInterceptor())

  setupSwagger(app)

  const port = env.port
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`)
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`)
}
bootstrap()

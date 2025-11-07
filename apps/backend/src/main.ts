import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { setupSwagger } from './config/swagger'
import { LoggingInterceptor } from './shared/interceptors'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000', // TODO: add check for env
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  app.setGlobalPrefix('api')

  // biome-ignore lint/correctness/useHookAtTopLevel: this is a NestJS hook, not a React hook
  app.useGlobalInterceptors(new LoggingInterceptor())

  setupSwagger(app)

  const port = process.env.PORT ?? 4000
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`)
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`)
}
bootstrap()

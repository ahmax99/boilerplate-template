import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000', // TODO: add check for env
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  await app.listen(process.env.PORT ?? 3001)
}
bootstrap()

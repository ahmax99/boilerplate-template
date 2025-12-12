import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import type { Env } from './env'

export const setupSwagger = (app: INestApplication, env: Env): void => {
  const config = new DocumentBuilder()
    .setTitle('Boilerplate Template API')
    .setDescription(
      'A production-ready NestJS backend with oRPC for type-safe API contracts, ' +
        'Prisma for database access, and hexagonal architecture.\n\n' +
        '**Authentication:** This API uses Better Auth for authentication. ' +
        'For complete authentication API documentation (sign-up, sign-in, sign-out, OAuth, etc.), ' +
        `visit the Better Auth OpenAPI reference at [here](${env.baseUrl}/api/auth/reference).\n\n` +
        'Most endpoints in this documentation require authentication unless marked as public.'
    )
    .setVersion('1.0.0')
    .addTag('Profile', 'User profile endpoints (authenticated)')
    .addTag('Users', 'User management endpoints (admin only)')
    .addTag('Todos', 'Todo management endpoints')
    .addTag('Health', 'Health check endpoints')
    .addServer(env.baseUrl, 'Development server')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey
  })

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Boilerplate API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .scheme-container { margin: 20px 0 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      },
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3
    }
  })
}

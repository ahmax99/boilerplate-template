import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Boilerplate Template API')
    .setDescription(
      'A production-ready NestJS backend with oRPC for type-safe API contracts, ' +
        'Prisma for database access, and hexagonal architecture.\n\n'
    )
    .setVersion('1.0.0')
    .addTag('Users', 'User management endpoints')
    .addTag('Todos', 'Todo management endpoints')
    .addServer(
      process.env.API_URL || 'http://localhost:4000',
      'Development server'
    )
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

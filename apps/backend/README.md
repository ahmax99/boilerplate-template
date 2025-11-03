<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## API Server for Full-Stack Boilerplate

A production-ready NestJS backend with:
- **oRPC** for type-safe API contracts
- **Prisma** for database access
- **SWC** for fast compilation (72ms builds) - [Configuration Guide](../docs/swc-configuration.md)
- **Modular architecture** with feature separation

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm run dev
```

The API will be available at `http://localhost:4000/api`

## Key Features

### oRPC Implementation
- Type-safe API endpoints using `@repo/contract`
- Input validation with Zod schemas
- Shared types between frontend and backend

### Database Layer
- Prisma ORM with PostgreSQL
- Accelerate support for connection pooling
- Migrations management

### Development Tools
- SWC compiler for fast rebuilds - [SWC Documentation](https://swc.rs/docs/configuration)
- Jest for unit and integration tests
- Built-in health checks and metrics

## API Documentation

The API follows the OpenAPI specification. After starting the server:

1. Access Swagger UI at `http://localhost:4000/api/docs`
2. Or import the OpenAPI spec from `http://localhost:4000/api-json`

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [oRPC for NestJS](https://orpc.unnoq.com/docs/nestjs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SWC Documentation](https://swc.rs/docs/configuration)

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

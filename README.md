# Boilerplate Template

Modern full-stack monorepo boilerplate built with Turborepo, Bun, and TypeScript.

## Tech Stack

### Runtime & Build Tools
- **[Bun](https://bun.sh/)** - Fast all-in-one JavaScript runtime and package manager
- **[Turborepo](https://turbo.build/repo)** - High-performance build system for monorepos
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Backend
- **[Elysia](https://elysiajs.com/)** - Fast and ergonomic web framework for Bun
- **[Prisma](https://www.prisma.io/)** - Type-safe ORM with Neon adapter
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Frontend
- **[Next.js](https://nextjs.org/)** - React framework with App Router
- **[React](https://react.dev/)** - UI library with Server Components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[React Hook Form](https://react-hook-form.com/)** - Form validation
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management

### Database & Caching
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL
- **[Upstash Redis](https://upstash.com/)** - Serverless Redis for caching

### Authorization & Storage
- **[CASL](https://casl.js.org/)** - Isomorphic authorization library
- **[AWS S3](https://aws.amazon.com/s3/)** - Object storage for file uploads

### Code Quality
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files

## Workspace Structure

### Apps (`apps/`)

#### `backend-boilerplate`
RESTful API built with Elysia and Bun runtime.

**Features:**
- Post and comment management
- S3 presigned URL generation for image uploads
- CASL-based authorization
- OpenAPI/Swagger documentation
- Rate limiting and bot detection

**Tech:** Elysia, Prisma, CASL, AWS SDK

#### `nextjs-boilerplate`
Modern full-stack Next.js application with authentication and file uploads.

**Features:**
- OIDC authentication with Cognito
- Role-based authorization with CASL
- S3 file uploads with presigned URLs
- Transactional emails with Resend
- Dark mode support
- Error monitoring with Sentry
- Vercel Analytics integration

**Tech:** Next.js 16, React 19, CASL, Tailwind CSS 4, shadcn/ui, React Hook Form, Zod, Zustand

### Shared Packages (`shared/`)

#### `@shared/config`
Shared configuration package containing Zod schemas, type definitions, and error constants.

**Exports:**
- Post and Comment validation schemas
- Email validation utilities
- Standardized error definitions (NOT_FOUND, UNAUTHORIZED, etc.)

#### `@shared/neon`
Prisma client configured for Neon serverless PostgreSQL.

**Features:**
- Neon serverless adapter with connection pooling
- WebSocket support for real-time capabilities
- Global singleton pattern
- Database migration and seeding scripts

#### `@shared/redis`
Upstash Redis client for serverless caching and data storage.

**Use Cases:**
- Session storage
- Rate limiting
- Query caching
- Temporary data (OTPs, verification codes)

#### `@shared/typescript-config`
Shared TypeScript configurations used across the monorepo.

## Getting Started

### Prerequisites

- **Bun** >= 1.3.8
- **Node.js** >= 24

### Installation

Install dependencies:
```bash
bun install
```

### Development

Start all apps and packages in development mode:
```bash
bun run dev
```

Start a specific app:
```bash
turbo dev --filter=backend-boilerplate
```

### Build

Build all apps and packages:
```bash
bun run build
```

Build a specific package:
```bash
turbo build --filter=@shared/neon
```

### Code Quality

Check types across all packages:
```bash
bun run check-types
```

Format code with Biome:
```bash
bun run format
```

Check formatting and linting:
```bash
bun run check-format
```

### Package Management

Check for outdated packages:
```bash
bun run check-updates
```

Update packages interactively:
```bash
bun run update-packages
```

Check for version mismatches across workspaces:
```bash
bun run check-mismatches
```

Sync package versions:
```bash
bun run sync-packages
```

## Environment Setup

Each package requiring environment variables includes an `.env.example` file:

- **`shared/neon`** - Requires `DATABASE_URL` for Neon PostgreSQL
- **`shared/redis`** - Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- **`apps/backend-boilerplate`** - See app-specific `.env.example` for full configuration

Copy `.env.example` to `.env` in each package and fill in your credentials.

## CI/CD

This repository includes GitHub Actions workflows:

- **CI Pipeline** - Type checking, linting, and builds
- **SBOM Generation** - Software Bill of Materials
- **Branch Cleanup** - Automatic deletion of merged branches

## Monorepo Features

- **Shared dependencies** - Common packages reused across apps
- **Incremental builds** - Only rebuild what changed
- **Parallel execution** - Run tasks across packages simultaneously
- **Type safety** - End-to-end TypeScript support
- **Code sharing** - Share schemas, types, and utilities

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com/introduction.html)
- [Prisma Documentation](https://www.prisma.io/docs)

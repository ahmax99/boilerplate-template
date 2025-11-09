# Full-Stack Monorepo Boilerplate

A production-ready monorepo template with Next.js, NestJS, and shared packages. Built with TypeScript, Turborepo, and modern tooling.

## What's Inside?

This monorepo contains three applications and five shared packages.

### Applications

#### `apps/web` - Frontend Application
- **Tech Stack:** Next.js 16, React 19, TailwindCSS 4
- **Purpose:** Main user-facing web application
- **Features:**
  - Server Components and Server Actions
  - TanStack Query for data fetching
  - Framer Motion for animations
  - Dark mode support with next-themes
- **Port:** 3000
- **Run:** `turbo dev --filter=web`

#### `apps/backend` - API Server
- **Tech Stack:** NestJS 11, Prisma, oRPC
- **Purpose:** REST API server with type-safe endpoints
- **Features:**
  - Fast compilation with SWC (72ms builds)
  - Type-safe API contracts with oRPC
  - Database integration with Prisma
  - Modular architecture
- **Port:** 4000
- **Run:** `turbo dev --filter=backend`

#### `apps/storybook` - Component Documentation
- **Tech Stack:** Storybook 10, Vitest, Playwright
- **Purpose:** Visual testing and documentation for UI components
- **Features:**
  - Interactive component playground
  - Accessibility testing (a11y addon)
  - Visual regression testing
  - Component testing with Vitest
- **Port:** 6006
- **Run:** `turbo dev --filter=storybook`

### Shared Packages

#### `@repo/ui` - Component Library
- **Purpose:** Reusable React components shared across applications
- **Structure:**
  - **Atoms:** Basic building blocks (Button, Input, Label, etc.)
  - **Molecules:** Combined components (Card, Dialog, Form fields, etc.)
  - **Organisms:** Complex components (DataTable, Form, etc.)
- **Tech:** Radix UI primitives, TailwindCSS, shadcn/ui patterns
- **Exports:** Components, hooks, and utility functions

#### `@repo/contract` - API Contract
- **Purpose:** Type-safe API definitions shared between frontend and backend
- **Features:**
  - oRPC contracts for todos and users
  - Zod schemas for validation
  - Client factory functions for server and browser
  - Automatic type inference
- **Usage:** Import client in web app, implement in backend

#### `@repo/database` - Database Layer
- **Purpose:** Prisma schema and database client
- **Features:**
  - Prisma ORM with PostgreSQL
  - Type-safe database queries
  - Migration management
  - Prisma Accelerate support
- **Scripts:**
  - `db:generate` - Generate Prisma client
  - `db:migrate` - Run migrations
  - `db:deploy` - Deploy migrations to production

#### `@repo/tailwind-config` - Styling Configuration
- **Purpose:** Shared TailwindCSS configuration and global styles
- **Exports:**
  - Global CSS styles
  - PostCSS configuration
  - Custom animations (tw-animate-css)
- **Usage:** Imported by web, storybook, and ui packages

#### `@repo/typescript-config` - TypeScript Configuration
- **Purpose:** Shared TypeScript configurations
- **Configs:**
  - `base.json` - Base configuration
  - `nextjs.json` - Next.js specific settings
  - `nestjs.json` - NestJS specific settings
  - `react-library.json` - React library settings

## Tech Stack

- **Language:** TypeScript
- **Monorepo:** Turborepo with pnpm workspaces
- **Frontend:** Next.js 16, React 19, TailwindCSS 4
- **Backend:** NestJS 11, Prisma
- **API:** oRPC for type-safe communication
- **Testing:** Vitest, Playwright, Jest
- **Code Quality:** Biome (linting & formatting), Husky (git hooks)

## Common Commands

### Development

```sh
# Start all apps
turbo dev

# Start specific app
turbo dev --filter=web
turbo dev --filter=backend
turbo dev --filter=storybook
```

### Building

```sh
# Build all apps and packages
turbo build

# Build specific app
turbo build --filter=web
turbo build --filter=backend
```

### Type Checking

```sh
# Check types in all packages
turbo check-types

# Check types in specific package
turbo check-types --filter=web
```

### Database

```sh
# Generate Prisma client
turbo --filter=@repo/database db:generate

# Run migrations
turbo --filter=@repo/database db:migrate

# Deploy migrations
turbo --filter=@repo/database db:deploy
```

### Remote Caching

We use Turborepo's Remote Caching to share build artifacts across machines, speeding up builds. See our [Remote Caching Guide](./docs/remote-caching.md) for setup instructions and troubleshooting.

## Docker

### Prerequisites

Ensure Docker is installed and running on your system:

- **macOS:** [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows:** [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux:** [Docker Engine](https://docs.docker.com/engine/install/)

Verify installation:

```sh
docker --version
docker compose version
```

### Building Docker Images

#### Build Web Application

Build the Next.js web application image:

```sh
# macOS / Linux / Windows (PowerShell/CMD)
docker build -f apps/web/Dockerfile -t boilerplate-template-web:latest .
```

#### Build Backend Application

Build the NestJS backend application image:

```sh
# macOS / Linux / Windows (PowerShell/CMD)
docker build -f apps/backend/Dockerfile -t boilerplate-template-backend:latest .
```

#### Build with Remote Caching (Optional)

To leverage Turborepo's remote caching during Docker builds:

```sh
# macOS / Linux
docker build -f apps/web/Dockerfile \
  --build-arg TURBO_TOKEN="your-token" \
  --build-arg TURBO_TEAM="your-team" \
  -t boilerplate-template-web:latest .

# Windows (PowerShell)
docker build -f apps/web/Dockerfile `
  --build-arg TURBO_TOKEN="your-token" `
  --build-arg TURBO_TEAM="your-team" `
  -t boilerplate-template-web:latest .

# Windows (CMD)
docker build -f apps/web/Dockerfile ^
  --build-arg TURBO_TOKEN="your-token" ^
  --build-arg TURBO_TEAM="your-team" ^
  -t boilerplate-template-web:latest .
```

#### Multi-Platform Builds

Build images for multiple architectures (requires Docker Buildx):

```sh
# macOS / Linux
docker buildx build --platform linux/amd64,linux/arm64 \
  -f apps/web/Dockerfile \
  -t boilerplate-template-web:latest .

# Windows (PowerShell)
docker buildx build --platform linux/amd64,linux/arm64 `
  -f apps/web/Dockerfile `
  -t boilerplate-template-web:latest .
```

### Running with Docker Compose

#### Prerequisites

1. **Create `.env` file** in the project root with the following values:

```sh
cp .env.example .env
```

2. **Ensure you have the required environment variables**:
   - `DATABASE_URL`: Your Prisma Accelerate connection string
   - `TURBO_TOKEN` and `TURBO_TEAM`: Optional, for Turborepo remote caching during builds

#### Start All Services

```sh
# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f web
docker compose logs -f backend
```

The services will be available at:
- **Web**: http://localhost:3000 (or `$WEB_PORT`)
- **Backend**: http://localhost:4000 (or `$BACKEND_PORT`)

#### Health Checks

Both services include health checks:
- **Backend**: Checks `/health` endpoint every 30s
- **Web**: Checks root endpoint every 30s
- **Startup**: 40s grace period before health checks begin

View health status:
```sh
docker compose ps
```

#### Stop Services

```sh
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

#### Rebuild and Restart

```sh
# Rebuild images and restart services
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build web
```

### Running Individual Containers

#### Run Web Application

```sh
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e WEB_URL="http://localhost:3000" \
  --name boilerplate-web \
  boilerplate-template-web:latest
```

#### Run Backend Application

```sh
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-database-url" \
  --name boilerplate-backend \
  boilerplate-template-backend:latest
```

### Docker Best Practices

- **Layer Caching:** The Dockerfiles use multi-stage builds to optimize layer caching
- **pnpm Store Cache:** Build cache is mounted to speed up dependency installation
- **Turbo Prune:** Only necessary workspace dependencies are included in the image
- **Security:** Containers run as non-root users (nextjs/nodejs)
- **Standalone Output:** Next.js standalone mode minimizes image size

## Useful Links

Learn more about Turborepo:
- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Configuration](https://turborepo.com/docs/reference/configuration)
- [Turborepo Docker Guide](https://turborepo.com/docs/guides/tools/docker)
- [pnpm Docker Guide](https://pnpm.io/docker)
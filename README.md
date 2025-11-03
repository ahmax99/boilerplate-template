# Full-Stack Monorepo Boilerplate

A production-ready monorepo template with Next.js, NestJS, and shared packages. Built with TypeScript, Turborepo, and modern tooling.

## Quick Start

Install dependencies:

```sh
pnpm install
```

Start all apps in development mode:

```sh
pnpm dev
```

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
- **Run:** `pnpm dev --filter=web`

#### `apps/backend` - API Server
- **Tech Stack:** NestJS 11, Prisma, oRPC
- **Purpose:** REST API server with type-safe endpoints
- **Features:**
  - Fast compilation with SWC (72ms builds)
  - Type-safe API contracts with oRPC
  - Database integration with Prisma
  - Modular architecture
- **Port:** 4000
- **Run:** `pnpm dev --filter=backend`

#### `apps/storybook` - Component Documentation
- **Tech Stack:** Storybook 10, Vitest, Playwright
- **Purpose:** Visual testing and documentation for UI components
- **Features:**
  - Interactive component playground
  - Accessibility testing (a11y addon)
  - Visual regression testing
  - Component testing with Vitest
- **Port:** 6006
- **Run:** `pnpm dev --filter=storybook`

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
pnpm dev

# Start specific app
pnpm dev --filter=web
pnpm dev --filter=backend
pnpm dev --filter=storybook
```

### Building

```sh
# Build all apps and packages
pnpm build

# Build specific app
pnpm build --filter=web
pnpm build --filter=backend
```

### Type Checking

```sh
# Check types in all packages
pnpm check-types

# Check types in specific package
pnpm check-types --filter=web
```

### Database

```sh
# Generate Prisma client
pnpm --filter=@repo/database db:generate

# Run migrations
pnpm --filter=@repo/database db:migrate

# Deploy migrations
pnpm --filter=@repo/database db:deploy
```

### Remote Caching

#### What is Remote Caching?

Remote Caching allows your team to share build outputs across different machines. Instead of rebuilding the same code multiple times, Turborepo stores the results in a shared cache that everyone can access.

#### Why Use It?

- **Faster builds:** Skip rebuilding code that someone else already built
- **Save CI/CD time:** GitHub Actions can reuse builds from your local machine or other PRs
- **Team efficiency:** If a teammate built something, you get instant results

#### How It Works

1. **First build:** You run `turbo build` → Turborepo builds your code and uploads the result to the remote cache
2. **Next build:** Your teammate runs `turbo build` → Turborepo finds the cached result and skips rebuilding (takes seconds instead of minutes)
3. **CI/CD:** GitHub Actions checks the cache before building, saving time and resources

#### Setup for Team Members

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

**Step 1: Login to Vercel**

```bash
npx turbo login
```

This opens your browser to authenticate with Vercel.

**Step 2: Link to Remote Cache**

```bash
npx turbo link
```

Select the team and project when prompted. That's it! You're now sharing cache with the team.

**Step 3: Verify it's working**

```bash
npx turbo build
```

First time: Normal build time
Second time: Should see `>>> FULL TURBO` and complete in seconds

#### CI/CD Setup (Already Configured)

Our GitHub Actions workflow is already configured with remote caching. It uses:

- `TURBO_TOKEN`: Secret token for authentication (configured in GitHub Secrets)
- `TURBO_TEAM`: Your Vercel team slug (configured in GitHub Variables)

No additional setup needed for CI/CD! Every PR automatically benefits from remote caching.

#### Troubleshooting

**Not seeing cache hits?**

- Make sure you ran `turbo login` and `turbo link`
- Check that you're on the correct Vercel team
- Verify `TURBO_TOKEN` and `TURBO_TEAM` are set in GitHub repository settings

**Want to force a fresh build?**

```bash
npx turbo build --force
```

This bypasses the cache and rebuilds everything.

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

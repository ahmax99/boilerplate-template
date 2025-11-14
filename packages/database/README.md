# @repo/database

A shared database package for the monorepo, built with [Prisma ORM](https://www.prisma.io/docs) for type-safe database access and migrations.

## Overview

This package provides a centralized database layer that can be consumed by multiple applications in the monorepo. It includes:

- **Prisma Client** - Type-safe database client with auto-completion
- **Database Schema** - Centralized schema definition in `prisma/schema.prisma`
- **Migrations** - Version-controlled database migrations
- **Neon Serverless Driver** - Low-latency PostgreSQL driver for serverless environments
- **Singleton Pattern** - Optimized client instantiation for development and production

## What is Prisma?

Prisma is a next-generation ORM (Object-Relational Mapping) that consists of:

### Core Components

1. **Prisma Client** - Auto-generated and type-safe query builder for Node.js & TypeScript
2. **Prisma Migrate** - Declarative data modeling & migration system
3. **Prisma Studio** - GUI to view and edit data in your database

### Key Benefits

- **Type Safety** - Full TypeScript support with auto-generated types from your schema
- **Auto-completion** - IntelliSense for all database queries
- **Declarative Schema** - Define your data model in a human-readable format
- **Migration System** - Track and version control database schema changes
- **Database Agnostic** - Supports PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, and CockroachDB
- **Performance** - Optimized queries with low-latency serverless driver


## Presentation

For a visual representation of the database structure, see the [Entity Relationship Diagram](./diagrams/erd.drawio).

## Installation

This package is automatically installed as a workspace dependency. To use it in your app:

```json
{
  "dependencies": {
    "@repo/database": "workspace:*"
  }
}
```

## Usage

### Import the Prisma Client

```typescript
import { prisma } from '@repo/database'

// Query users
const users = await prisma.user.findMany({
  include: {
    todos: true
  }
})

// Create a new user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
})

// Update a todo
const updatedTodo = await prisma.todo.update({
  where: { id: 1 },
  data: { isDone: true }
})
```

## Database Seeding

### Running the Seed

```bash
# Run seed script directly
pnpm db:seed

# Or run automatically after migrations
pnpm db:migrate
```

The seed script will:
1. Clear existing User and Todo data
2. Create 3 sample users with associated todos
3. Display a summary of created records

### Customizing Seed Data

Edit `prisma/seed.ts` to modify the seed data:

```typescript
const user = await prisma.user.create({
  data: {
    email: 'custom@example.com',
    name: 'Custom User',
    todos: {
      create: [
        {
          title: 'Custom Todo',
          description: 'A custom todo item',
          isDone: false,
        },
      ],
    },
  },
})
```

### Automatic Seeding

The `prisma.seed` configuration in `package.json` ensures the seed runs automatically when you:
- Run `prisma migrate reset`
- Run `prisma migrate dev` (if database is empty)
- Run `prisma db seed` explicitly

## Development Workflow

### 1. Modify the Schema

Edit `prisma/schema.prisma` to add or modify models:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}
```

### 2. Create a Migration

```bash
pnpm db:migrate
```

### 3. Use the New Types

The Prisma Client is automatically updated with new types:

```typescript
import { prisma } from '@repo/database'

const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    authorId: 1
  }
})
```

## Environment Variables

Configure your database connection in `.env`:

```env
# Neon database connection string
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

## Neon Serverless Driver

This package uses the [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver) with Prisma's driver adapter for low-latency database access from serverless and edge environments.

### Benefits

✅ **Low Latency** - Optimized for serverless with message pipelining and HTTP/WebSocket support  
✅ **No Connection Limits** - Query over HTTP without traditional connection pooling constraints  
✅ **Edge Compatible** - Works in Cloudflare Workers, Vercel Edge Functions, and other edge runtimes  
✅ **Session Support** - WebSocket connections provide full PostgreSQL session and transaction support  
✅ **node-postgres Compatible** - Drop-in replacement for `pg` package with `Pool` and `Client` constructors  
✅ **Cost Effective** - No additional service fees (unlike Prisma Accelerate which requires paid subscription)  
✅ **Direct Connection** - Queries go directly to Neon without intermediary services

### Caveats

⚠️ **Cold Starts** - Neon computes scale to zero after 5 minutes of inactivity. First query after idle may take 500ms-2s  
⚠️ **Connection Timeouts** - May need to increase `connect_timeout` parameter for idle compute activation  
⚠️ **WebSocket Dependency** - Requires `ws` package and `webSocketConstructor` configuration in Node.js environments  
⚠️ **No Built-in Caching** - Unlike Prisma Accelerate, no automatic query result caching (implement your own if needed)  
⚠️ **Regional Latency** - Performance depends on proximity to Neon's data center (choose region wisely)

### Configuration

The driver is configured in `src/client.ts`:

```typescript
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import { PrismaClient } from '../generated/client/index.js'

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws

// For edge environments (Cloudflare Workers, Vercel Edge), enable HTTP queries:
// neonConfig.poolQueryViaFetch = true

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })
```

### When to Use HTTP vs WebSockets

**Use HTTP** (`neonConfig.poolQueryViaFetch = true`) for:
- Single, non-interactive queries ("one-shot queries")
- Edge environments without WebSocket support
- Fastest possible query execution

**Use WebSockets** (default) for:
- Interactive transactions with multiple queries
- Session-based operations
- Full PostgreSQL feature compatibility
- Node.js server environments

### Handling Cold Starts

To mitigate cold start latency, add timeout parameters to your connection string:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&connect_timeout=15&pool_timeout=15"
```

## Best Practices

### 1. Always Use Transactions for Related Operations

```typescript
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com' } }),
  prisma.todo.create({ data: { title: 'First todo', userId: 1 } })
])
```

### 2. Use Select to Optimize Queries

```typescript
// Only fetch needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true
  }
})
```

### 3. Handle Errors Gracefully

```typescript
try {
  await prisma.user.create({ data: { email: 'duplicate@example.com' } })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      console.error('Unique constraint violation')
    }
  }
  throw error
}
```

### 4. Use Middleware for Logging and Monitoring

```typescript
prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})
```

## Prisma Studio

View and edit your database in a visual interface:

```bash
npx prisma studio
```

This opens a browser-based GUI at `http://localhost:5555`.

## Resources

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)

### Neon
- [Neon Documentation](https://neon.com/docs)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon with Prisma Guide](https://neon.com/docs/guides/prisma)
- [Neon Connection Pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon GitHub Repository](https://github.com/neondatabase/serverless)

### This Project
- [Entity Relationship Diagram](./diagrams/erd.drawio)

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run `pnpm db:generate` to generate the Prisma Client.

### Migration Conflicts

If migrations are out of sync:

```bash
# Reset database (development only!)
npx prisma migrate reset

# Or mark migrations as applied
npx prisma migrate resolve --applied <migration_name>
```

### Connection Issues

Verify your `DATABASE_URL` is correct and the database is accessible:

```bash
npx prisma db pull
```

### "TypeError: bufferUtil.mask is not a function"

This error occurs when the `ws` module is missing the `bufferutil` dependency. Install it:

```bash
pnpm add -D bufferutil
```

### Connection Timeout with Neon

If you experience timeout errors like `P1001: Can't reach database server`, this is likely due to Neon's cold start. The compute may be idle and needs time to activate. Solutions:

1. **Increase timeout parameters** in your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?connect_timeout=15&pool_timeout=15"
   ```

2. **Keep compute active** by enabling Neon's "Always Active" feature (available on paid plans)

3. **Implement retry logic** for the first connection attempt after idle periods

## Contributing

When making schema changes:

1. Create a descriptive migration name
2. Update this README if adding new models
3. Update the ERD diagram in `diagrams/erd.drawio`
4. Test migrations in a development environment first
5. Never edit migration files after they've been applied

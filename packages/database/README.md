# @repo/database

A shared database package for the monorepo, built with [Prisma ORM](https://www.prisma.io/docs) for type-safe database access and migrations.

## Overview

This package provides a centralized database layer that can be consumed by multiple applications in the monorepo. It includes:

- **Prisma Client** - Type-safe database client with auto-completion
- **Database Schema** - Centralized schema definition in `prisma/schema.prisma`
- **Migrations** - Version-controlled database migrations
- **Prisma Accelerate** - Connection pooling and caching extension
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
- **Performance** - Optimized queries with connection pooling via Prisma Accelerate


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
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

For production with Prisma Accelerate:

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
```

## Prisma Accelerate

This package uses [Prisma Accelerate](https://www.prisma.io/docs/accelerate) for:

- **Connection Pooling** - Efficiently manage database connections
- **Global Caching** - Cache query results at the edge
- **Scalability** - Handle thousands of concurrent connections

The Accelerate extension is configured in `src/client.ts`:

```typescript
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient().$extends(withAccelerate())
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

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
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

## Contributing

When making schema changes:

1. Create a descriptive migration name
2. Update this README if adding new models
3. Update the ERD diagram in `diagrams/erd.drawio`
4. Test migrations in a development environment first
5. Never edit migration files after they've been applied

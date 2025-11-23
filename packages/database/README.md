# @repo/database

A shared database package built with [Prisma ORM](https://www.prisma.io/docs) for type-safe database access.

## Features

- **Prisma Client** - Type-safe database queries with auto-completion
- **Prisma Accelerate** - Global database cache and connection pooling
- **Migrations** - Version-controlled schema changes
- **Lazy Loading** - Client initializes only when first accessed

## Installation

Add to your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/database": "workspace:*"
  }
}
```

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp packages/database/.env.example packages/database/.env
   ```

2. Add your Prisma Accelerate connection string:
   ```env
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
   ```

## Usage

```typescript
import { prisma } from '@repo/database'

// Query users
const users = await prisma.user.findMany({
  include: { todos: true }
})

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
})

// Update todo
await prisma.todo.update({
  where: { id: 1 },
  data: { isDone: true }
})
```

## Available Scripts

```bash
# Generate Prisma Client
pnpm db:generate

# Create and apply migration
pnpm db:migrate

# Apply migrations (production)
pnpm db:deploy

# Seed database
pnpm db:seed

# Open Prisma Studio
npx prisma studio
```

## Schema

Current models in `prisma/schema.prisma`:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  todos Todo[]
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  isDone      Boolean  @default(false)
  userId      Int
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

## Development Workflow

1. **Modify schema** in `prisma/schema.prisma`
2. **Create migration**: `pnpm db:migrate`
3. **Use new types** - Prisma Client auto-updates

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
- [Entity Relationship Diagram](./diagrams/erd.drawio)
## Contributing

When making schema changes:

1. Create a descriptive migration name
2. Update this README if adding new models
3. Update the ERD diagram in `diagrams/erd.drawio`
4. Test migrations in a development environment first
5. Never edit migration files after they've been applied
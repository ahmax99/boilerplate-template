# oRPC Contract

Shared oRPC contract definitions and client factory functions for type-safe API communication.

## Overview

This package provides:
- **Contract definitions** - Type-safe API endpoint specifications
- **Zod schemas** - Input/output validation schemas
- **Client factories** - Reusable functions for creating oRPC clients
- **Type exports** - Shared TypeScript types

## Client Factory Functions

### `createServerClient(config)`

Creates an oRPC client for **server-side** usage (Server Components, API routes, etc.).

**Configuration:**

```typescript
interface ServerClientConfig {
  url: string
  headers?: () => Promise<Record<string, string>> | Record<string, string>
}
```

**Example:**

```typescript
import { createServerClient } from '@repo/contract'

const client = createServerClient({
  url: 'http://api-service:4000/api',
  headers: async () => ({
    'Content-Type': 'application/json',
    cookie: 'session=abc123',
    authorization: 'Bearer token'
  })
})

// Use the client
const todos = await client.todos.list({ limit: 10 })
```
---

### `createBrowserClient(config)`

Creates an oRPC client for **browser-side** usage (Client Components).

**Configuration:**

```typescript
interface BrowserClientConfig {
  url: string
  headers?: Record<string, string>
}
```

**Example:**

```typescript
import { createBrowserClient } from '@repo/contract'

const client = createBrowserClient({
  url: 'https://api.example.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Use the client
const todos = await client.todos.list({ limit: 10 })
```
---

### Server-Side (Next.js Server Components)

```typescript
// apps/web/src/lib/api/orpc.server.ts
import 'server-only'
import { headers } from 'next/headers'
import { createServerClient, type ORPCClient } from '@repo/contract'

const client: ORPCClient = createServerClient({
  url: process.env.API_URL,
  headers: async () => {
    const h = await headers()
    return {
      'Content-Type': 'application/json',
      cookie: h.get('cookie') ?? '',
      authorization: h.get('authorization') ?? ''
    }
  }
})

export const orpcServer = client
```

## Available Contracts

### Users Contract

```typescript
import { usersContract } from '@repo/contract'

// Available endpoints:
usersContract.users.list      // List users with pagination
usersContract.users.find      // Find user by ID
usersContract.users.create    // Create a new user
usersContract.users.update    // Update user
usersContract.users.delete    // Delete user
```

### Todos Contract

```typescript
import { todosContract } from '@repo/contract'

// Available endpoints:
todosContract.todos.list      // List todos with optional user filtering
todosContract.todos.find      // Find todo by ID
todosContract.todos.create    // Create a new todo
todosContract.todos.update    // Update todo
todosContract.todos.delete    // Delete todo
```

## HTTP Methods

The factory functions use `OpenAPILink`, which maps contracts to HTTP endpoints:

- **`GET`** - Read-only operations (list, find)
- **`POST`** - Create operations and mutations
- **`PUT`/`PATCH`** - Update operations
- **`DELETE`** - Delete operations

If no method is specified in the contract, it defaults to `POST`.

## References

- [oRPC Documentation](https://orpc.unnoq.com)
- [oRPC OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link)
- [oRPC Contract First](https://orpc.unnoq.com/docs/contract-first/getting-started)
- [Zod Documentation](https://zod.dev)

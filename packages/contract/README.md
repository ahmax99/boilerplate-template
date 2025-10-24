# oRPC Contract

This package contains the oRPC contract definitions and client implementation based on the [oRPC documentation](https://orpc.unnoq.com/docs/getting-started).

## Structure

- **`src/contracts/`** - Contract definitions for API endpoints
- **`src/schemas/`** - Zod schemas for data validation
- **`src/client/index.ts`** - Client factory function
- **`src/router.ts`** - Application contract router

## Usage

### Creating a Client

```typescript
import { orpcClientInstance } from '@repo/contract'

// Create a client instance with URL and optional headers
const client = orpcClientInstance('http://localhost:3001', {
  Authorization: 'Bearer your-token'
})

// Users
await client.users.list({ limit: 10, offset: 0 })
await client.users.find({ id: 1 })
await client.users.create({ email: 'john@example.com', name: 'John Doe' })
await client.users.update({ id: 1, name: 'Johnny' })
await client.users.delete({ id: 1 })

// Todos
await client.todos.list({ userId: 1, limit: 10, offset: 0 })
await client.todos.find({ id: 1 })
await client.todos.create({ title: 'Buy milk', description: null, isDone: false, userId: 1 })
await client.todos.update({ id: 1, isDone: true })
await client.todos.delete({ id: 1 })
```

### Client Configuration

The `orpcClient` function accepts two parameters:

- **`url`** (required) - The base URL of your API server
- **`headers`** (optional) - Custom headers to include with requests

```typescript
import { orpcClientInstance } from '@repo/contract'

// Basic client
const client = orpcClientInstance('https://api.example.com')

// Client with custom headers
const authenticatedClient = orpcClientInstance('https://api.example.com', {
  Authorization: 'Bearer your-token',
  'X-Custom-Header': 'value'
})
```

## Features

- **Type Safety** - Full TypeScript support with end-to-end type safety
- **Simple API** - Single factory function for creating clients
- **Flexible Headers** - Easy to add authentication and custom headers
- **Contract-First** - Contracts define both server and client behavior

## API Endpoints

The client provides access to the following endpoints:

### Users

- `users.list(params)` - List users with pagination
- `users.find({ id })` - Find user by ID
- `users.create(userData)` - Create a new user
- `users.update({ id, ...updates })` - Update user
- `users.delete({ id })` - Delete user

### Todos

- `todos.list(params)` - List todos with optional user filtering
- `todos.find({ id })` - Find todo by ID
- `todos.create(todoData)` - Create a new todo
- `todos.update({ id, ...updates })` - Update todo
- `todos.delete({ id })` - Delete todo

## HTTP Methods with oRPC/OpenAPI

- This package uses the OpenAPI client (`OpenAPILink`), so procedures are exposed over standard HTTP endpoints.
- If a contract route does not specify an HTTP method, the client will default to using `POST` when calling it.
- To opt into `GET` for read-only procedures (e.g., list/find), add `method: 'GET'` to the route in your contract and redeploy.

Example (Users):

```typescript
import { oc } from '@orpc/contract'

export const listUsersContract = oc
  .route({
    method: 'GET',
    summary: 'List users',
    tags: ['Users']
  })
  // ... input/output
```

Example (Todos):

```typescript
import { oc } from '@orpc/contract'

export const listTodosContract = oc
  .route({
    method: 'GET',
    summary: 'List todos',
    tags: ['Todos']
  })
  // ... input/output
```

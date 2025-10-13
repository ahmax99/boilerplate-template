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
import { orpcClient } from '@repo/contract'

// Create a client instance with URL and optional headers
const client = orpcClient('http://localhost:3001', {
  Authorization: 'Bearer your-token'
})

// List users
const users = await client.users.list({ limit: 10 })

// Find a specific user
const user = await client.users.find({ id: 1 })

// Create a new user
const newUser = await client.users.create({
  email: 'john@example.com',
  name: 'John Doe'
})
```

### Client Configuration

The `orpcClient` function accepts two parameters:

- **`url`** (required) - The base URL of your API server
- **`headers`** (optional) - Custom headers to include with requests

```typescript
import { orpcClient } from '@repo/contract'

// Basic client
const client = orpcClient('https://api.example.com')

// Client with custom headers
const authenticatedClient = orpcClient('https://api.example.com', {
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

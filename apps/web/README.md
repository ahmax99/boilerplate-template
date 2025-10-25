This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## oRPC Architecture

This application uses [oRPC](https://orpc.unnoq.com) for type-safe API communication with a separated backend service.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js Web App (apps/web)                                 │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Server Components                                 │     │
│  │  - Uses: orpcServer (from lib/api/orpc.server.ts)  │     │
│  │  - Makes HTTP requests with server-side headers    │     │
│  │  - Forwards cookies, authorization                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Client Components                                 │     │
│  │  - Uses: orpcClient (from lib/api/orpc.client.ts)  │     │
│  │  - Unified client (SSR-aware)                      │     │
│  │  - TanStack Query integration                      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│  Backend API (separate service)                             │
│  - OpenAPI-compatible endpoints                             │
│  - Shared contract from @repo/contract                      │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

#### 1. `lib/api/orpc.server.ts` - Server-Side Client

**Purpose:**
- Makes HTTP requests to backend API from server
- Forwards per-request headers (cookies, authorization)
- Used exclusively in Server Components

**Usage:**
```typescript
// In Server Components
import { orpcServer } from '@/lib/api/orpc.server'

export async function TodosList() {
  const todos = await orpcServer.todos.list({ limit: 50 })
  return <div>{/* render */}</div>
}
```

#### 2. `lib/api/orpc.client.ts` - Unified Client (SSR-Aware)

**Purpose:**
- Unified client that works on both server and browser
- During SSR: Uses `globalThis.$client` (server client with headers)
- In browser: Uses `browserClient` (regular HTTP requests)
- Integrated with TanStack Query for mutations and queries

**Usage:**
```typescript
// In Client Components
'use client'
import { orpcClient } from '@/lib/api'

export function TodoCreate() {
  const createMutation = useMutation({
    ...orpcClient.todos.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ ... })
      router.refresh() // Refresh server components
    }
  })
}
```

### Why This Architecture?

#### ✅ Separated Backend
- Backend is a separate service (not in Next.js app)
- Must use `OpenAPILink` for HTTP communication

#### ✅ SSR Optimization
- Server-side client forwards cookies/auth headers
- Enables authenticated SSR requests
- Unified client prevents accidental browser client usage on server

#### ✅ Type Safety
- End-to-end type safety via shared `@repo/contract`
- Contract defines input/output schemas
- Both server and client use same types

#### ⚠️ Trade-offs
- **HTTP overhead**: Server makes HTTP calls to backend (not direct function calls)
- **Requires `router.refresh()`**: Server Component data outside TanStack Query cache
- **Two clients**: Need separate `orpcServer` and `orpcClient` imports

# @shared/redis

Upstash Redis client for serverless caching and data storage.

## Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Add your Upstash Redis credentials to `.env`:
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

Get your credentials from [Upstash Console](https://console.upstash.com/).

## Usage

Import the Redis client in your application:

```typescript
import { redis } from '@shared/redis'

// Set a value
await redis.set('key', 'value')

// Get a value
const value = await redis.get('key')

// Set with expiration (in seconds)
await redis.setex('session:123', 3600, 'user-data')

// Delete a key
await redis.del('key')

// Increment a counter
await redis.incr('page-views')

// Store JSON objects
await redis.set('user:1', { name: 'John', email: 'john@example.com' })
const user = await redis.get('user:1')
```

## Common Use Cases

- **Session Storage** - Store user sessions with TTL
- **Rate Limiting** - Track API request counts
- **Caching** - Cache expensive database queries
- **Counters** - Track page views, likes, etc.
- **Temporary Data** - Store OTPs, verification codes

## Features

- **Serverless-First** - HTTP-based REST API, no persistent connections
- **Global Edge Network** - Low latency worldwide
- **Automatic Serialization** - JSON objects handled automatically
- **Type Safety** - Full TypeScript support

## Development

Build the package:
```bash
bun run build
```

Watch mode for development:
```bash
bun run dev
```

Type checking:
```bash
bun run check-types
```

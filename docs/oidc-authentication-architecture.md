# OIDC Authentication Architecture with AWS Cognito & Better Auth

## Overview

This document outlines the architecture and data flow for implementing OpenID Connect (OIDC) authentication using AWS Cognito as the identity provider and Better Auth as the authentication framework. This implementation follows a **BFF (Backend for Frontend) pattern** where:

- **Next.js BFF**: Handles all OAuth/OIDC flows, token management, and session persistence
- **Backend Service**: Stateless API that validates user identity via signed session tokens
- **No Direct Frontend-to-Database**: All data access goes through the backend API
- **Redis Session Store**: Shared session storage accessible by Next.js BFF

## Architecture Components

### 1. **AWS Cognito (Identity Provider)**
- **User Pool**: Manages user directory and authentication
- **App Client**: OAuth 2.0 client credentials for your application
- **Hosted UI Domain**: Cognito-managed authentication pages
- **OIDC Endpoints**: Standard OpenID Connect discovery endpoints

### 2. **Backend Service (Elysia - Stateless API)**
- **Framework**: Elysia.js (already in use)
- **Database**: Neon PostgreSQL (via @shared/neon)
- **Authentication**: Validates signed session tokens from BFF
- **No OAuth Logic**: Does not handle OAuth flows or token management
- **No Direct Session Storage**: Relies on BFF-provided user identity

### 3. **Next.js BFF (Backend for Frontend)**
- **Framework**: Next.js with React Server Components
- **Auth Library**: Better Auth v1.4.18 for OAuth/OIDC flows
- **Session Storage**: Redis (via @shared/redis) for session persistence
- **Token Management**: Handles token refresh, validation, and storage
- **User Identity**: Retrieves userId from backend after authentication
- **Request Signing**: Signs requests to backend with session tokens
- **Session Cookies**: HTTP-only, Secure cookies for browser sessions

### 4. **Redis Session Store (Shared)**
- **Purpose**: Centralized session persistence for Next.js BFF
- **Data Stored**: User sessions, OAuth tokens, userId mappings
- **Access**: Only accessible by Next.js BFF, not directly by backend
- **TTL**: Automatic expiration based on token lifetime

---

## Data Flow

### Authentication Flow (Authorization Code Grant with PKCE)

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   User      │          │   Next.js    │          │    Redis    │          │   Backend   │          │ AWS Cognito │
│  (Browser)  │          │     BFF      │          │   Session   │          │  (Elysia)   │          │  User Pool  │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                         │                         │                         │
       │  1. Click "Sign in"    │                         │                         │                         │
       ├───────────────────────>│                         │                         │                         │
       │                        │                         │                         │                         │
       │                        │  2. Generate PKCE       │                         │                         │
       │                        │     challenge & state   │                         │                         │
       │                        │                         │                         │                         │
       │                        │  3. Store PKCE verifier │                         │                         │
       │                        │     in session          │                         │                         │
       │                        ├────────────────────────>│                         │                         │
       │                        │                         │                         │                         │
       │  4. Redirect to Cognito with:                    │                         │                         │
       │     - client_id, redirect_uri                    │                         │                         │
       │     - scope, code_challenge                      │                         │                         │
       │<───────────────────────┤                         │                         │                         │
       │                        │                         │                         │                         │
       │  5. Redirect to Cognito Hosted UI                │                         │                         │
       ├──────────────────────────────────────────────────────────────────────────────────────────────────────>│
       │                        │                         │                         │                         │
       │  6. User authenticates (username/password)       │                         │                         │
       │<──────────────────────────────────────────────────────────────────────────────────────────────────────┤
       │                        │                         │                         │                         │
       │  7. User grants consent│                         │                         │                         │
       ├──────────────────────────────────────────────────────────────────────────────────────────────────────>│
       │                        │                         │                         │                         │
       │  8. Redirect to callback with code               │                         │                         │
       │     (http://localhost:3000/api/auth/callback/cognito?code=ABC123)          │                         │
       │<──────────────────────────────────────────────────────────────────────────────────────────────────────┤
       │                        │                         │                         │                         │
       │  9. Forward to BFF     │                         │                         │                         │
       ├───────────────────────>│                         │                         │                         │
       │                        │                         │                         │                         │
       │                        │  10. Retrieve PKCE      │                         │                         │
       │                        │      verifier           │                         │                         │
       │                        │<────────────────────────┤                         │                         │
       │                        │                         │                         │                         │
       │                        │  11. Exchange code for tokens                     │                         │
       │                        │      (with code_verifier)                         │                         │
       │                        ├──────────────────────────────────────────────────────────────────────────────>│
       │                        │                         │                         │                         │
       │                        │  12. Return tokens:     │                         │                         │
       │                        │      - ID Token (JWT)   │                         │                         │
       │                        │      - Access Token     │                         │                         │
       │                        │      - Refresh Token    │                         │                         │
       │                        │<──────────────────────────────────────────────────────────────────────────────┤
       │                        │                         │                         │                         │
       │                        │  13. Validate ID Token  │                         │                         │
       │                        │      - Verify signature │                         │                         │
       │                        │      - Check issuer     │                         │                         │
       │                        │      - Validate claims  │                         │                         │
       │                        │                         │                         │                         │
       │                        │  14. Extract Cognito sub (subject ID)              │                         │
       │                        │                         │                         │                         │
       │                        │  15. Request userId from backend                  │                         │
       │                        │      POST /api/v1/auth/resolve-user               │                         │
       │                        │      Body: { cognitoSub: "..." }                  │                         │
       │                        ├──────────────────────────────────────────────────>│                         │
       │                        │                         │                         │                         │
       │                        │                         │                         │  16. Find/create user   │
       │                        │                         │                         │      in database        │
       │                        │                         │                         │      (Neon PostgreSQL)  │
       │                        │                         │                         │                         │
       │                        │  17. Return userId      │                         │                         │
       │                        │<──────────────────────────────────────────────────┤                         │
       │                        │                         │                         │                         │
       │                        │  18. Store session in Redis:                      │                         │
       │                        │      - userId           │                         │                         │
       │                        │      - cognitoSub       │                         │                         │
       │                        │      - access_token     │                         │                         │
       │                        │      - refresh_token    │                         │                         │
       │                        │      - id_token         │                         │                         │
       │                        │      - expires_at       │                         │                         │
       │                        ├────────────────────────>│                         │                         │
       │                        │                         │                         │                         │
       │                        │  19. Generate signed    │                         │                         │
       │                        │      session token      │                         │                         │
       │                        │      (JWT with userId)  │                         │                         │
       │                        │                         │                         │                         │
       │  20. Set session cookie (HTTP-only, Secure)      │                         │                         │
       │      Contains: sessionId                         │                         │                         │
       │<───────────────────────┤                         │                         │                         │
       │                        │                         │                         │                         │
       │  21. Redirect to app   │                         │                         │                         │
       │      (authenticated)   │                         │                         │                         │
       │<───────────────────────┤                         │                         │                         │
       │                        │                         │                         │                         │
```

### Token Refresh Flow (BFF Handles Transparently)

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   User      │          │   Next.js    │          │    Redis    │          │   Backend   │          │ AWS Cognito │
│  (Browser)  │          │     BFF      │          │   Session   │          │  (Elysia)   │          │  User Pool  │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                         │                         │                         │
       │  1. Access protected   │                         │                         │                         │
       │     route/API          │                         │                         │                         │
       ├───────────────────────>│                         │                         │                         │
       │                        │                         │                         │                         │
       │                        │  2. Retrieve session    │                         │                         │
       │                        │     from Redis          │                         │                         │
       │                        │<────────────────────────┤                         │                         │
       │                        │                         │                         │                         │
       │                        │  3. Check token expiry  │                         │                         │
       │                        │     (access_token TTL)  │                         │                         │
       │                        │                         │                         │                         │
       │                        │  4. Token expired!      │                         │                         │
       │                        │     Use refresh_token   │                         │                         │
       │                        ├──────────────────────────────────────────────────────────────────────────────>│
       │                        │                         │                         │                         │
       │                        │  5. Return new tokens   │                         │                         │
       │                        │<──────────────────────────────────────────────────────────────────────────────┤
       │                        │                         │                         │                         │
       │                        │  6. Update session in   │                         │                         │
       │                        │     Redis with new      │                         │                         │
       │                        │     tokens & expiry     │                         │                         │
       │                        ├────────────────────────>│                         │                         │
       │                        │                         │                         │                         │
       │                        │  7. Continue with       │                         │                         │
       │                        │     original request    │                         │                         │
       │                        │     (transparent to     │                         │                         │
       │                        │     user)               │                         │                         │
       │                        │                         │                         │                         │
       │  8. Response returned  │                         │                         │                         │
       │<───────────────────────┤                         │                         │                         │
       │                        │                         │                         │                         │
```

### Authenticated Request Flow (BFF to Backend)

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐          ┌──────────────┐
│   User      │          │   Next.js    │          │    Redis    │          │   Backend   │
│  (Browser)  │          │     BFF      │          │   Session   │          │  (Elysia)   │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                         │                         │
       │  1. Request data       │                         │                         │
       │     (e.g., GET /posts) │                         │                         │
       ├───────────────────────>│                         │                         │
       │                        │                         │                         │
       │                        │  2. Retrieve session    │                         │
       │                        │     by sessionId cookie │                         │
       │                        │<────────────────────────┤                         │
       │                        │                         │                         │
       │                        │  3. Generate signed     │                         │
       │                        │     session token (JWT) │                         │
       │                        │     Payload: {          │                         │
       │                        │       userId: "123",    │                         │
       │                        │       sessionId: "...", │                         │
       │                        │       iat, exp          │                         │
       │                        │     }                   │                         │
       │                        │     Signed with shared  │                         │
       │                        │     secret              │                         │
       │                        │                         │                         │
       │                        │  4. Forward request to backend                    │
       │                        │     Headers:            │                         │
       │                        │       X-User-Id: "123"  │                         │
       │                        │       X-Session-Token: "signed.jwt.token"         │
       │                        ├──────────────────────────────────────────────────>│
       │                        │                         │                         │
       │                        │                         │                         │  5. Verify session token
       │                        │                         │                         │     - Validate signature
       │                        │                         │                         │     - Check expiration
       │                        │                         │                         │     - Extract userId
       │                        │                         │                         │
       │                        │                         │                         │  6. Process request
       │                        │                         │                         │     with userId context
       │                        │                         │                         │
       │                        │  7. Return response     │                         │
       │                        │<──────────────────────────────────────────────────┤
       │                        │                         │                         │
       │  8. Return to user     │                         │                         │
       │<───────────────────────┤                         │                         │
       │                        │                         │                         │
```

---

## Implementation Details

### AWS Cognito Configuration

#### 1. User Pool Setup
```
Region: us-east-1 (or your preferred region)
User Pool Name: boilerplate-user-pool
```

#### 2. App Client Configuration
```
App Client Name: boilerplate-app-client
Authentication flows:
  - Authorization code grant
OAuth 2.0 Scopes:
  - openid
  - profile
  - email
Callback URLs:
  - http://localhost:3000/api/auth/callback/cognito (development)
  - https://yourdomain.com/api/auth/callback/cognito (production)
Sign-out URLs:
  - http://localhost:3000 (development)
  - https://yourdomain.com (production)
```

#### 3. Hosted UI Domain
```
Domain: your-app.auth.us-east-1.amazoncognito.com
```

#### 4. OIDC Discovery Endpoint
```
https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid-configuration
```

### Backend Implementation (Elysia + Better Auth)

#### 1. Environment Variables

**Next.js BFF (.env.local)**
```env
# AWS Cognito Configuration
COGNITO_CLIENT_ID=your-app-client-id
COGNITO_CLIENT_SECRET=your-app-client-secret
COGNITO_DOMAIN=your-app.auth.us-east-1.amazoncognito.com
COGNITO_REGION=us-east-1
COGNITO_USERPOOL_ID=us-east-1_XXXXXXXXX

# Better Auth Configuration
BETTER_AUTH_SECRET=your-random-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000 # Next.js BFF URL

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Shared Secret for Session Token Signing (MUST match backend)
SESSION_TOKEN_SECRET=your-shared-secret-min-32-chars

# Redis (for session storage)
REDIS_URL=your-redis-connection-string
```

**Backend Service (.env)**
```env
# Database
DATABASE_URL=your-neon-connection-string

# Shared Secret for Session Token Verification (MUST match BFF)
SESSION_TOKEN_SECRET=your-shared-secret-min-32-chars

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

#### 2. Next.js BFF - Better Auth Configuration
**File**: `lib/auth.ts` (Next.js app)

```typescript
import { betterAuth } from 'better-auth'
import { genericOAuth } from 'better-auth/plugins'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.connect()

export const auth = betterAuth({
  // Use Redis for session storage (not database)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Custom session storage using Redis
  storage: {
    async get(key: string) {
      return await redisClient.get(key)
    },
    async set(key: string, value: string, ttl?: number) {
      if (ttl) {
        await redisClient.setEx(key, ttl, value)
      } else {
        await redisClient.set(key, value)
      }
    },
    async delete(key: string) {
      await redisClient.del(key)
    },
  },

  // Using pre-configured Cognito provider
  socialProviders: {
    cognito: {
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      domain: process.env.COGNITO_DOMAIN!,
      region: process.env.COGNITO_REGION!,
      userPoolId: process.env.COGNITO_USERPOOL_ID!,
    },
  },
})
```

#### 3. Next.js BFF - Auth API Routes
**File**: `app/api/auth/[...all]/route.ts` (Next.js app)

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

**File**: `app/api/auth/callback/cognito/route.ts` (Next.js app)

```typescript
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Better Auth handles the OAuth callback
  const response = await auth.handler(request)
  
  // After successful authentication, retrieve userId from backend
  const session = await auth.api.getSession({ 
    headers: request.headers as any 
  })
  
  if (session?.user) {
    const cognitoSub = session.user.id // Cognito subject ID
    
    // Call backend to resolve/create user
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/resolve-user`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cognitoSub }),
      }
    )
    
    const { userId } = await backendResponse.json()
    
    // Store userId in session (Redis)
    await auth.api.updateSession({
      session: session.session,
      update: {
        userId, // Add userId to session
      },
    })
  }
  
  return response
}
```

#### 4. Backend - User Resolution Endpoint
**File**: `src/modules/auth/auth.controller.ts` (Backend)

```typescript
import { Elysia, t } from 'elysia'
import { db } from '@/lib/db'

export const authController = new Elysia({ prefix: '/auth' })
  .post(
    '/resolve-user',
    async ({ body }) => {
      const { cognitoSub } = body
      
      // Find or create user by Cognito subject ID
      let user = await db.user.findUnique({
        where: { cognitoSub },
      })
      
      if (!user) {
        user = await db.user.create({
          data: {
            cognitoSub,
            // Additional user fields will be populated later
          },
        })
      }
      
      return { userId: user.id }
    },
    {
      body: t.Object({
        cognitoSub: t.String(),
      }),
    }
  )
```

#### 5. Update Backend Main Application
**File**: `src/index.ts` (Backend)

```typescript
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { env } from '@/config/env'
import { postController } from '@/modules/posts/post.controller'
import { authController } from '@/modules/auth/auth.controller'

const app = new Elysia({ prefix: '/api/v1' })
  .use(cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }))
  .use(authController) // User resolution endpoint
  .use(postController)
  .listen(env.BACKEND_BASE_URL.port)

console.log(`🦊 Backend is running at ${app.server?.url}`)
```

#### 6. Next.js BFF - Session Token Generator
**File**: `lib/session-token.ts` (Next.js app)

```typescript
import jwt from 'jsonwebtoken'

const SECRET = process.env.SESSION_TOKEN_SECRET!

export interface SessionTokenPayload {
  userId: string
  sessionId: string
  iat: number
  exp: number
}

export function generateSessionToken(userId: string, sessionId: string): string {
  return jwt.sign(
    {
      userId,
      sessionId,
    },
    SECRET,
    {
      expiresIn: '1h', // Short-lived, BFF refreshes it
    }
  )
}

export function verifySessionToken(token: string): SessionTokenPayload {
  return jwt.verify(token, SECRET) as SessionTokenPayload
}
```

#### 7. Next.js BFF - API Request Wrapper
**File**: `lib/backend-api.ts` (Next.js app)

```typescript
import { auth } from '@/lib/auth'
import { generateSessionToken } from '@/lib/session-token'
import { cookies } from 'next/headers'

export async function callBackendAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get session from Redis
  const session = await auth.api.getSession({
    headers: { cookie: cookies().toString() } as any,
  })
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  const userId = session.session.userId
  const sessionId = session.session.id
  
  // Generate signed session token
  const sessionToken = generateSessionToken(userId, sessionId)
  
  // Forward request to backend with auth headers
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...options.headers,
        'X-User-Id': userId,
        'X-Session-Token': sessionToken,
      },
    }
  )
  
  if (!response.ok) {
    throw new Error(`Backend API error: ${response.statusText}`)
  }
  
  return response.json()
}
```

#### 8. Backend - Session Token Validation Middleware
**File**: `src/middleware/auth.middleware.ts` (Backend)

```typescript
import { Elysia } from 'elysia'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

interface SessionTokenPayload {
  userId: string
  sessionId: string
  iat: number
  exp: number
}

export const authMiddleware = new Elysia()
  .derive(async ({ headers }) => {
    const userId = headers['x-user-id']
    const sessionToken = headers['x-session-token']
    
    if (!userId || !sessionToken) {
      throw new Error('Unauthorized: Missing authentication headers')
    }
    
    try {
      // Verify session token signature
      const payload = jwt.verify(
        sessionToken,
        env.SESSION_TOKEN_SECRET
      ) as SessionTokenPayload
      
      // Validate userId matches token payload
      if (payload.userId !== userId) {
        throw new Error('Unauthorized: User ID mismatch')
      }
      
      return {
        userId: payload.userId,
        sessionId: payload.sessionId,
      }
    } catch (error) {
      throw new Error('Unauthorized: Invalid session token')
    }
  })
```

### Frontend Implementation (Next.js)

#### 1. Better Auth Client Setup
**File**: `lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/client'
import { genericOAuthClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // http://localhost:3001
  plugins: [genericOAuthClient()],
})
```

#### 2. Sign-In Component
**File**: `components/auth/SignInButton.tsx`

```typescript
'use client'

import { authClient } from '@/lib/auth-client'

export function SignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'cognito',
      callbackURL: '/dashboard', // Redirect after successful auth
    })
  }

  return (
    <button onClick={handleSignIn}>
      Sign in with AWS Cognito
    </button>
  )
}
```

#### 3. Session Management Hook
**File**: `hooks/useSession.ts`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((data) => {
      setSession(data)
      setLoading(false)
    })
  }, [])

  return { session, loading }
}
```

#### 4. Protected Route Component
**File**: `components/auth/ProtectedRoute.tsx`

```typescript
'use client'

import { useSession } from '@/hooks/useSession'
import { redirect } from 'next/navigation'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## Database Schema

### Backend Database (Neon PostgreSQL)

The backend only needs to store minimal user information:

```sql
-- Users table (minimal, backend-only)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub TEXT UNIQUE NOT NULL, -- AWS Cognito subject ID
  email TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);
```

### Redis Session Store (Next.js BFF)

Sessions are stored in Redis with the following structure:

```typescript
// Session key: `session:{sessionId}`
interface RedisSession {
  userId: string              // Backend user ID
  cognitoSub: string          // AWS Cognito subject ID
  accessToken: string         // Cognito access token
  refreshToken: string        // Cognito refresh token
  idToken: string             // Cognito ID token
  expiresAt: number           // Token expiration timestamp
  createdAt: number           // Session creation timestamp
  updatedAt: number           // Last update timestamp
}
```

**Key Benefits:**
- **No OAuth tokens in database**: All sensitive tokens stay in Redis
- **Automatic expiration**: Redis TTL handles session cleanup
- **Fast access**: In-memory lookups for session validation
- **Stateless backend**: Backend never touches OAuth tokens

---

## Security Considerations

### 1. **PKCE (Proof Key for Code Exchange)**
- Enabled by default in Better Auth
- Protects against authorization code interception attacks
- Required for public clients (SPAs, mobile apps)

### 2. **Token Storage (BFF-Only)**
- **ID Token**: Validated by BFF, stored in Redis, never sent to browser
- **Access Token**: Stored in Redis by BFF, never exposed to client
- **Refresh Token**: Stored in Redis by BFF, never exposed to client
- **Session Cookie**: HTTP-only, Secure, SameSite=Lax (contains only sessionId)
- **Backend**: Never stores or handles OAuth tokens

### 3. **Session Token Security**
- **Signed JWT**: BFF signs tokens with shared secret
- **Short-lived**: 1-hour expiration, BFF refreshes automatically
- **Payload validation**: Backend verifies signature and userId match
- **Prevents spoofing**: Backend cannot be tricked with fake userId headers

### 4. **HTTPS Requirements**
- Production must use HTTPS for all endpoints
- Cognito requires HTTPS callback URLs in production
- Session cookies must have Secure flag in production
- BFF-to-Backend communication should use HTTPS in production

### 5. **CORS Configuration**

**Backend (Elysia)**
```typescript
import { cors } from '@elysiajs/cors'

const app = new Elysia()
  .use(cors({
    origin: env.ALLOWED_ORIGINS, // Only allow Next.js BFF
    credentials: true,
  }))
```

**Next.js BFF**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        ],
      },
    ]
  },
}
```

### 6. **Token Validation (BFF)**
- ID Token signature verification using Cognito's JWKS
- Issuer validation against expected Cognito User Pool
- Audience validation against App Client ID
- Expiration time validation
- Automatic token refresh before expiration

### 7. **Session Security**
- Session rotation on privilege escalation
- Automatic session cleanup via Redis TTL
- Redis-backed session storage for scalability
- Session fingerprinting (IP + User Agent)
- Shared secret rotation strategy for SESSION_TOKEN_SECRET

### 8. **Backend Security**
- **Stateless design**: No session state, only validates tokens
- **Minimal trust**: Validates every request signature
- **No OAuth exposure**: Never handles OAuth flows or tokens
- **Rate limiting**: Implement on both BFF and backend
- **Input validation**: Validate all inputs with Zod schemas

---

## API Endpoints

### Next.js BFF Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/signin/cognito` | Initiate OAuth flow with Cognito |
| GET | `/api/auth/callback/cognito` | OAuth callback handler |
| POST | `/api/auth/signout` | Sign out user (clears session) |
| GET | `/api/auth/session` | Get current session |

### Backend Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/resolve-user` | Resolve/create user by cognitoSub | No |
| GET | `/api/v1/posts` | Get all posts | Yes |
| POST | `/api/v1/posts` | Create new post | Yes |
| GET | `/api/v1/posts/:id` | Get post by ID | Yes |

**Authentication Headers (for protected endpoints):**
```
X-User-Id: {userId}
X-Session-Token: {signed-jwt-token}
```

### AWS Cognito Endpoints

| Endpoint | Description |
|----------|-------------|
| `/.well-known/openid-configuration` | OIDC discovery document |
| `/oauth2/authorize` | Authorization endpoint |
| `/oauth2/token` | Token endpoint |
| `/oauth2/userInfo` | User info endpoint |
| `/oauth2/revoke` | Token revocation |

---

## Error Handling

### Common Error Scenarios

1. **Invalid Authorization Code**
   - Cause: Code already used or expired
   - Solution: Redirect user to re-authenticate

2. **Token Validation Failure**
   - Cause: Invalid signature, expired token, wrong issuer
   - Solution: Clear session, redirect to login

3. **Network Errors**
   - Cause: Cognito service unavailable
   - Solution: Retry with exponential backoff, show user-friendly error

4. **Session Expired**
   - Cause: Session TTL exceeded
   - Solution: Attempt token refresh, fallback to re-authentication

---

## Testing Strategy

### 1. Unit Tests
- Token validation logic
- Session management
- User creation/update logic

### 2. Integration Tests
- Full OAuth flow (mock Cognito)
- Token refresh flow
- Session expiration handling

### 3. E2E Tests
- Complete authentication flow
- Protected route access
- Sign-out flow

---

## Deployment Checklist

### AWS Cognito Setup
- [ ] AWS Cognito User Pool created
- [ ] App Client configured with correct callback URLs
- [ ] Hosted UI domain set up
- [ ] OAuth scopes configured (openid, profile, email)

### Next.js BFF Setup
- [ ] Environment variables configured (.env.local)
- [ ] Redis instance configured for session storage
- [ ] Better Auth installed and configured
- [ ] Session token signing secret generated (SESSION_TOKEN_SECRET)
- [ ] CORS headers configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Rate limiting configured for auth endpoints

### Backend Setup
- [ ] Environment variables configured (.env)
- [ ] Database migrations run (users table)
- [ ] Session token verification secret configured (must match BFF)
- [ ] CORS configured to allow only BFF origin
- [ ] Auth middleware applied to protected routes
- [ ] Error monitoring set up

### Production Security
- [ ] HTTPS enabled for all services
- [ ] Session cookies set to Secure flag
- [ ] Cognito callback URLs updated to production URLs
- [ ] Shared secrets rotated and stored securely (e.g., AWS Secrets Manager)
- [ ] Redis connection secured with TLS
- [ ] Backend-to-BFF communication uses HTTPS
- [ ] Rate limiting enabled on both BFF and backend
- [ ] Security headers configured (CSP, HSTS, etc.)

### Monitoring & Observability
- [ ] Session creation/destruction logging
- [ ] Token refresh monitoring
- [ ] Failed authentication attempt tracking
- [ ] Backend API latency monitoring
- [ ] Redis connection health checks

---

## Monitoring & Observability

### Metrics to Track
- Authentication success/failure rates
- Token refresh frequency
- Session duration distribution
- OAuth callback latency
- Database query performance for auth operations

### Logging
- Authentication attempts (success/failure)
- Token validation errors
- Session creation/destruction
- OAuth callback errors
- Cognito API errors

---

## Future Enhancements

1. **Multi-Factor Authentication (MFA)**
   - Leverage Cognito's built-in MFA support
   - SMS or TOTP-based verification

2. **Social Login Providers**
   - Add Google, GitHub, Facebook via Cognito federation
   - Configure in Cognito User Pool identity providers

3. **Role-Based Access Control (RBAC)**
   - Extend user model with roles
   - Implement authorization middleware using @casl/ability (already installed)

4. **Account Linking**
   - Allow users to link multiple OAuth providers
   - Better Auth supports this natively

5. **Passwordless Authentication**
   - Magic links via email
   - WebAuthn/Passkeys support

---

## References

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Cognito Provider](https://www.better-auth.com/docs/authentication/cognito)
- [Better Auth Generic OAuth Plugin](https://www.better-auth.com/docs/plugins/generic-oauth)
- [AWS Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)

import { loadSecrets } from './config/secrets.js'

// Load secrets from AWS Secrets Manager
await loadSecrets()

import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { env } from './config/env.js'
import { routes } from './routes/index.js'

const app = new Elysia()
  .get('/', () => ({
    message: 'Backend Boilerplate API',
    version: '1.0.0',
    documentation: '/api/v1/openapi',
    endpoints: {
      posts: '/api/v1/posts',
      comments: '/api/v1/comments'
    }
  }))
  .use(routes)
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  )
  .listen(env.AWS_LWA_PORT)

console.log(`🚀 Server running on port ${env.AWS_LWA_PORT}`)

export default app

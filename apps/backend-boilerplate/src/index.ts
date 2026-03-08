import { cors } from '@elysiajs/cors'
import { node } from '@elysiajs/node'
import { Elysia } from 'elysia'

import { env } from './config/env.js'
import { loadSecrets } from './config/secrets.js'
import { routes } from './routes/index.js'

await loadSecrets()

const app = new Elysia({ adapter: node() })
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
  .listen(env.BACKEND_PORT)

console.log(`🚀 Server running on port ${env.BACKEND_PORT}`)

export default app

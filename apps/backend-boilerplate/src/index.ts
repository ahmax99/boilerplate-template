import { Elysia } from 'elysia'

import { routes } from './routes/index.js'

// Vercel serverless function entry point
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

export default app

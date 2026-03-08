import { env } from './config/env.js'
import app from './index.js'

app.listen(env.BACKEND_BASE_URL.port)

console.log(`🦊 Backend is running at ${app.server?.url}`)

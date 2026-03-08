import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { WebSocket } from 'ws'

import { PrismaClient } from '../prisma/generated/client.js'
import { env } from './env.js'

neonConfig.webSocketConstructor = WebSocket

neonConfig.poolQueryViaFetch = true

declare global {
  var prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL })

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }

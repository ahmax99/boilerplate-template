import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { WebSocket } from 'ws'

import { PrismaClient } from '../prisma/generated/client.js'
import { getEnv } from './env.js'

neonConfig.webSocketConstructor = WebSocket
neonConfig.poolQueryViaFetch = true

declare global {
  var prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const getPrismaClient = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const { DATABASE_URL } = getEnv()
  const adapter = new PrismaNeon({ connectionString: DATABASE_URL })
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client

  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  }
})

import { withAccelerate } from '@prisma/extension-accelerate'

import { PrismaClient } from '../generated/client/index.js'

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  return new PrismaClient({
    accelerateUrl: databaseUrl
  }).$extends(withAccelerate())
}

let _prisma: ExtendedPrismaClient | undefined

function getPrismaClient(): ExtendedPrismaClient {
  if (_prisma) return _prisma

  if (globalForPrisma.prisma) {
    _prisma = globalForPrisma.prisma
    return _prisma
  }

  _prisma = createPrismaClient()

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _prisma
  }

  return _prisma
}

// Export a Proxy that lazily initializes the client
export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = client[prop as keyof ExtendedPrismaClient]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

import { withAccelerate } from '@prisma/extension-accelerate'

import { PrismaClient } from '../generated/client/index.js'

const createPrismaClient = () =>
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
  }).$extends(withAccelerate())

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>
}

export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get: (_, prop) => {
    if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrismaClient()
    const value =
      globalForPrisma.prisma[prop as keyof typeof globalForPrisma.prisma]
    return typeof value === 'function'
      ? value.bind(globalForPrisma.prisma)
      : value
  }
})

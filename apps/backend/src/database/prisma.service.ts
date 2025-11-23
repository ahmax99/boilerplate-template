import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common'
import { prisma } from '@repo/database'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await prisma.$connect()
  }

  async onModuleDestroy() {
    await prisma.$disconnect()
  }

  getClient() {
    return prisma
  }
}

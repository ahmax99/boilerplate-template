import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common'
import { PrismaClientBase } from '@repo/database'

@Injectable()
export class PrismaService
  extends PrismaClientBase
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

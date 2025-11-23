import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
// biome-ignore lint/style/useImportType: HealthCheckService and PrismaHealthIndicator needed at runtime for DI
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'

// biome-ignore lint/style/useImportType: PrismaService needed at runtime for DI
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkHealth() {
    try {
      const result = await this.health.check([
        () => this.prismaHealth.pingCheck('database', this.prisma.getClient())
      ])

      this.logger.log({
        message: 'Health check passed',
        status: result.status,
        details: result.details
      })
    } catch (error) {
      this.logger.error({
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

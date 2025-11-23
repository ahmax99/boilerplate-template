import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
// biome-ignore lint/style/useImportType: HealthCheckResult needed at runtime for DI
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  PrismaHealthIndicator
} from '@nestjs/terminus'

// biome-ignore lint/style/useImportType: PrismaService needed at runtime for DI
import { PrismaService } from '../../database/prisma.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma.getClient())
    ])
  }
}

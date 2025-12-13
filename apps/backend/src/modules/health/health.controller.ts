import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
// biome-ignore lint/style/useImportType: HealthCheckResult needed at runtime for DI
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  PrismaHealthIndicator
} from '@nestjs/terminus'

// biome-ignore lint/style/useImportType: PrismaService needed at runtime for DI
import { PrismaService } from '../../database/prisma.service'
import { Public } from '../auth/decorators'

@Public()
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
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check passed'
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma.getClient())
    ])
  }

  @Get('auth/ok')
  @ApiOperation({ summary: 'Auth service health check' })
  @ApiResponse({
    status: 200,
    description: 'Auth service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'Auth service is healthy' }
      }
    }
  })
  authHealthCheck() {
    return {
      status: 'ok',
      message: 'Auth service is healthy'
    }
  }
}

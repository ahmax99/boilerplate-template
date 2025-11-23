import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TerminusModule } from '@nestjs/terminus'

import { DatabaseModule } from '../../database/prisma.module'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
  imports: [TerminusModule, DatabaseModule, ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [HealthService]
})
export class HealthModule {}

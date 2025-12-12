import { Module } from '@nestjs/common'
import { APP_GUARD, Reflector } from '@nestjs/core'

import { Env } from '../../config/env'
import { AuthController } from './auth.controller'
import { AUTH_INSTANCE, createAuth } from './config'
import { AuthGuard, RolesGuard } from './guards'

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      useFactory: (env: Env) => createAuth(env),
      inject: [Env]
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, auth: ReturnType<typeof createAuth>) =>
        new AuthGuard(reflector, auth),
      inject: [Reflector, AUTH_INSTANCE]
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
      inject: [Reflector]
    }
  ],
  exports: [AUTH_INSTANCE]
})
export class AuthModule {}

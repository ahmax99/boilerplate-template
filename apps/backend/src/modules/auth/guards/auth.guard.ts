import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
// biome-ignore lint/style/useImportType: keep class available at runtime for NestJS DI
import { Reflector } from '@nestjs/core'
import { fromNodeHeaders } from 'better-auth/node'

import { AUTH_INSTANCE } from '../config'
import { IS_PUBLIC_KEY } from '../decorators'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_INSTANCE)
    private readonly auth: ReturnType<typeof import('better-auth').betterAuth>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) return true

    const request = context.switchToHttp().getRequest()

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers)
    })

    if (!session?.user)
      throw new UnauthorizedException('Authentication required')

    request.user = session.user
    request.session = session

    return true
  }
}

import { All, Controller, Inject, Req, Res } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'
import type { Request, Response } from 'express'

import { AUTH_INSTANCE } from './config'
import { Public } from './decorators'

@Public()
@ApiExcludeController()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_INSTANCE)
    private readonly auth: ReturnType<typeof import('better-auth').betterAuth>
  ) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(this.auth)(req, res)
  }
}

import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth'
import type { User } from 'better-auth/types'

import { CurrentUser } from '../../shared/decorators'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the authenticated user profile. Requires authentication.'
  })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt
    }
  }

  @Get('public')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Public endpoint',
    description: 'This endpoint is accessible without authentication'
  })
  async publicEndpoint() {
    return {
      message: 'This is a public endpoint, no authentication required'
    }
  }

  @Get('optional')
  @OptionalAuth()
  @ApiOperation({
    summary: 'Optional auth endpoint',
    description: 'This endpoint works with or without authentication'
  })
  async optionalEndpoint(@CurrentUser() user?: User) {
    return {
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name
          }
        : null
    }
  }
}

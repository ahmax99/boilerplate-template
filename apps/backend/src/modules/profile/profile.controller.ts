import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Session, User } from '@repo/database'

import { CurrentSession } from '../auth/decorators'

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the authenticated user profile. Requires authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully'
  })
  async getProfile(
    @CurrentSession() session: { user: User; session: Session }
  ) {
    return {
      user: session.user,
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
        ipAddress: session.session.ipAddress,
        userAgent: session.session.userAgent
      }
    }
  }
}

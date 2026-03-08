'use server'

import { refreshTokenGrant } from 'openid-client'

import { AppError } from '@/features/error/lib/AppError'

import { getOIDCClient } from '../../lib/cognitoClient'
import { getSession } from './session'

export const getTokens = async () => {
  const [session, config] = await Promise.all([getSession(), getOIDCClient()])

  if (!session.refreshToken) throw new AppError('UNAUTHORIZED')

  const tokens = await refreshTokenGrant(config, session.refreshToken)

  return {
    idToken: tokens.id_token,
    accessToken: tokens.access_token
  }
}

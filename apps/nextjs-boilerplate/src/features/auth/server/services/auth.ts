'use server'

import { authorizationCodeGrant, buildAuthorizationUrl } from 'openid-client'

import { env } from '@/config/env'
import { logger } from '@/config/logger'

import { getOIDCClient } from '../../lib/cognitoClient'
import { PUBLIC_ROUTES } from '../../lib/routes'
import type { CallbackParams } from '../../schemas/auth.schema'
import {
  clearPKCEData,
  generateNonce,
  generatePKCE,
  generateState
} from '../../utils/pkce'
import { createUser } from '../api'
import { assignDefaultRoleGroup } from './role'
import { destroySession, getSessionData, setSessionData } from './session'

const log = logger.child({ module: 'auth' })

export const handleLogin = async (callbackUrl?: string) => {
  const { codeVerifier, codeChallenge } = await generatePKCE()
  const state = generateState()
  const nonce = generateNonce()

  await setSessionData({
    codeVerifier,
    state,
    nonce,
    callbackUrl: callbackUrl || PUBLIC_ROUTES.HOME
  })

  const config = await getOIDCClient()

  const parameters = {
    redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce
  }

  const authUrl = buildAuthorizationUrl(config, parameters)

  log.info({ callbackUrl }, 'Login initiated')

  return { authUrl: authUrl.toString() }
}

export const handleCallback = async (
  currentUrl: URL,
  params: CallbackParams
) => {
  const { code, state, error } = params

  // validate query parameters
  switch (true) {
    case !!error:
      log.warn({ error }, 'OAuth callback returned error')
      return { redirectUrl: `/auth/login?error=${error}` }
    case !code || !state:
      log.warn('OAuth callback missing code or state')
      return { redirectUrl: '/auth/login?error=missing_code' }
  }

  const [session, config] = await Promise.all([
    getSessionData(),
    getOIDCClient()
  ])

  // validate session data
  switch (true) {
    case state !== session.state:
      log.warn('OAuth state mismatch')
      return { redirectUrl: '/auth/login?error=invalid_state' }
    case !session.codeVerifier:
      log.warn('OAuth code verifier missing from session')
      return { redirectUrl: '/auth/login?error=missing_verifier' }
    case !session.nonce:
      log.warn('OAuth nonce missing from session')
      return { redirectUrl: '/auth/login?error=missing_nonce' }
  }

  const tokens = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: session.codeVerifier,
    expectedState: state,
    expectedNonce: session.nonce
  })

  const claims = tokens.claims()

  // validate claims and id_token
  if (!claims || !tokens.id_token) {
    log.warn('OAuth token exchange returned invalid claims or missing id_token')
    return { redirectUrl: '/auth/login?error=invalid_token' }
  }

  const sessionData = {
    userId: claims.sub,
    email: claims.email as string,
    refreshToken: tokens.refresh_token
  }

  // save user session data first
  await setSessionData(sessionData)

  // then clear PKCE data (must be sequential to avoid race condition)
  await clearPKCEData()

  // create user in database (idempotent - returns existing user if already exists)
  await createUser(
    {
      cognitoSub: claims.sub,
      email: claims.email as string,
      name: claims.name as string
    },
    tokens.id_token
  )

  // assign user to default "Users" group on first login
  await assignDefaultRoleGroup(claims.sub)

  log.info({ userId: claims.sub }, 'User authenticated successfully')

  const redirectUrl = session.callbackUrl ?? PUBLIC_ROUTES.HOME

  return { redirectUrl }
}

export const handleLogout = async () => {
  const session = await getSessionData()

  await destroySession()

  log.info({ userId: session.userId }, 'User logged out')

  const logoutUrl = new URL(
    `https://${env.COGNITO_DOMAIN}.auth.${env.AWS_REGION}.amazoncognito.com/logout`
  )

  logoutUrl.searchParams.set('client_id', env.COGNITO_CLIENT_ID)
  logoutUrl.searchParams.set('logout_uri', env.NEXT_PUBLIC_BASE_URL)

  return { logoutUrl: logoutUrl.toString() }
}

'use server'

import { authorizationCodeGrant, buildAuthorizationUrl } from 'openid-client'

import { env } from '@/config/env'
import { logger } from '@/config/logger'

import { getOIDCClient } from '../../lib/cognitoClient'
import { PUBLIC_ROUTES } from '../../lib/routes'
import type { CallbackParams, SessionData } from '../../schemas/auth.schema'
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

const validateCallbackParams = (params: CallbackParams) => {
  const { code, state, error } = params

  if (error) {
    log.warn({ error }, 'OAuth callback returned error')
    return `/auth/login?error=${error}`
  }

  if (!code || !state) {
    log.warn('OAuth callback missing code or state')
    return '/auth/login?error=missing_code'
  }

  return null
}

const validateSession = (
  session: SessionData,
  state: CallbackParams['state']
): string | null => {
  if (state !== session.state) {
    log.warn('OAuth state mismatch')
    return '/auth/login?error=invalid_state'
  }

  if (!session.codeVerifier) {
    log.warn('OAuth code verifier missing from session')
    return '/auth/login?error=missing_verifier'
  }

  if (!session.nonce) {
    log.warn('OAuth nonce missing from session')
    return '/auth/login?error=missing_nonce'
  }

  return null
}

export const handleCallback = async (
  currentUrl: URL,
  params: CallbackParams
) => {
  const paramError = validateCallbackParams(params)
  if (paramError) return { redirectUrl: paramError }

  const [session, config] = await Promise.all([
    getSessionData(),
    getOIDCClient()
  ])

  const sessionError = validateSession(session, params.state)
  if (sessionError) return { redirectUrl: sessionError }

  const tokens = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: session.codeVerifier,
    expectedState: params.state,
    expectedNonce: session.nonce
  })

  const claims = tokens.claims()

  if (!claims || !tokens.id_token) {
    log.warn('OAuth token exchange returned invalid claims or missing id_token')
    return { redirectUrl: '/auth/login?error=invalid_token' }
  }

  const email = claims.email as string

  // save user session data first, then clear PKCE data — must be sequential
  // to avoid a race condition between the two session writes.
  await setSessionData({
    userId: claims.sub,
    email,
    refreshToken: tokens.refresh_token
  })
  await clearPKCEData()

  // idempotent - returns existing user if already created
  await createUser(
    { cognitoSub: claims.sub, email, name: claims.name as string },
    tokens.id_token
  )

  // assign user to default "Users" group on first login
  await assignDefaultRoleGroup(claims.sub)

  log.info({ userId: claims.sub }, 'User authenticated successfully')

  return { redirectUrl: session.callbackUrl ?? PUBLIC_ROUTES.HOME }
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

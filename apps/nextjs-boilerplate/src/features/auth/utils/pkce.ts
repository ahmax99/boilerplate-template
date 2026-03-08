import {
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
  randomState
} from 'openid-client'

import { getSession } from '../server/services/session'

export const generatePKCE = async () => {
  const codeVerifier = randomPKCECodeVerifier()
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier)

  return {
    codeVerifier,
    codeChallenge
  }
}

export const clearPKCEData = async () => {
  const session = await getSession()

  delete session.codeVerifier
  delete session.state
  delete session.nonce
  delete session.callbackUrl

  await session.save()
}

export const generateState = () => randomState()

export const generateNonce = () => randomState()

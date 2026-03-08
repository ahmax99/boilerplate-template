'use server'

import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'

import { SESSION_CONFIG } from '../../constants/session'
import type { SessionData } from '../../schemas/auth.schema'

export const getSession = async () => {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_CONFIG)

  return session
}

export const setSessionData = async (data: SessionData) => {
  const session = await getSession()

  Object.assign(session, data)

  await session.save()
}

export const getSessionData = async () => {
  const session = await getSession()

  return {
    userId: session.userId,
    email: session.email,
    refreshToken: session.refreshToken,
    codeVerifier: session.codeVerifier,
    state: session.state,
    nonce: session.nonce,
    callbackUrl: session.callbackUrl
  }
}

export const destroySession = async () => {
  const session = await getSession()

  session.destroy()
}

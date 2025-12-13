'use server'

import { cookies } from 'next/headers'
import type { Session, User } from 'better-auth/types'

import { env } from '@/config/env'

/**
 * Get current session from NestJS backend
 */
export const getSession = async (): Promise<
  (Session & { user: User }) | null
> => {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('better-auth.session_token')

  if (!sessionCookie?.value) return null

  const response = await fetch(`${env.API_URL}/auth/get-session`, {
    method: 'GET',
    headers: {
      Cookie: `better-auth.session_token=${sessionCookie.value}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) return null

  const data = await response.json()

  if (data.session && data.user) {
    return {
      ...data.session,
      user: data.user
    }
  }

  return null
}

/**
 * Require authentication (throw if not authenticated)
 */
export const requireAuth = async (): Promise<Session & { user: User }> => {
  const session = await getSession()
  if (!session) throw new Error('Authentication required')

  return session
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession()

  return !!session
}

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getSession()

  return session?.user ?? null
}

/**
 * Sign out user
 */
export const signOut = async (): Promise<{
  error: null | { message?: string }
}> => {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('better-auth.session_token')

  if (!sessionCookie?.value) return { error: null }

  const response = await fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/sign-out`,
    {
      method: 'POST',
      headers: {
        Cookie: `better-auth.session_token=${sessionCookie.value}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    }
  )

  if (!response.ok) return { error: { message: 'Failed to sign out' } }

  cookieStore.delete('better-auth.session_token')

  return { error: null }
}

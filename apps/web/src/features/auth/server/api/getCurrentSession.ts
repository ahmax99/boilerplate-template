'use server'

import { cookies } from 'next/headers'
import type { Session, User } from 'better-auth'

import { env } from '@/config/env'

export const getCurrentSession = async (): Promise<{
  session: Session
  user: User
} | null> => {
  const cookieStore = await cookies()

  const response = await fetch(`${env.API_URL}/auth/get-session`, {
    headers: {
      cookie: cookieStore.toString()
    },
    credentials: 'include',
    cache: 'no-store'
  })

  if (!response.ok) return null

  return await response.json()
}

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const OAuth2Start = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl')
    const loginUrl = callbackUrl
      ? `/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/api/auth/login'

    globalThis.location.href = loginUrl
  }, [searchParams])

  return null
}

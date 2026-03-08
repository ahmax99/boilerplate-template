import { type NextRequest, NextResponse } from 'next/server'

import type { CallbackParams } from '@/features/auth/schemas/auth.schema'
import { handleCallback } from '@/features/auth/server/services/auth'

export const GET = async (request: NextRequest) => {
  const params = Object.fromEntries(
    request.nextUrl.searchParams
  ) as CallbackParams

  const { redirectUrl } = await handleCallback(new URL(request.url), params)

  return NextResponse.redirect(new URL(redirectUrl, request.url))
}

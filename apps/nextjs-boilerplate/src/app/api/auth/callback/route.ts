import { type NextRequest, NextResponse } from 'next/server'

import { env } from '@/config/env'
import type { CallbackParams } from '@/features/auth/schemas/auth.schema'
import { handleCallback } from '@/features/auth/server/services/auth'

export const GET = async (request: NextRequest) => {
  const params = Object.fromEntries(
    request.nextUrl.searchParams
  ) as CallbackParams

  // Behind CloudFront + Lambda Function URL, request.url reflects the Lambda hostname (CloudFront strips the viewer Host for OAC SigV4 signing).
  const publicUrl = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    env.NEXT_PUBLIC_BASE_URL
  )

  console.log('[auth/callback]', {
    requestUrl: request.url,
    publicUrl: publicUrl.toString(),
    redirectUriSentToCognito: `${publicUrl.origin}${publicUrl.pathname}`,
    baseUrl: env.NEXT_PUBLIC_BASE_URL
  })

  const { redirectUrl } = await handleCallback(publicUrl, params)

  return NextResponse.redirect(new URL(redirectUrl, env.NEXT_PUBLIC_BASE_URL))
}

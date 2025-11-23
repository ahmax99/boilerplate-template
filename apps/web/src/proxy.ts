import { type NextRequest, NextResponse } from 'next/server'

import { publicAuthRoutes } from '@/features/auth/consts/routes'
import { getSession } from '@/lib/auth/auth.server'

export async function proxy(request: NextRequest) {
  const session = await getSession()

  if (!session)
    return NextResponse.redirect(new URL(publicAuthRoutes.login, request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}

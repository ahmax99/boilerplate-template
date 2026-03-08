import { type NextRequest, NextResponse } from 'next/server'

import {
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  PUBLIC_ROUTES
} from './features/auth/lib/routes'

const protectedPaths = Object.values(PROTECTED_ROUTES)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if auth_session cookie exists
  const sessionCookie = request.cookies.get('auth_session')
  const isAuthenticated = !!sessionCookie?.value
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  // Redirect to login if accessing protected route without valid session
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(PUBLIC_AUTH_ROUTES.LOGIN, request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to home if accessing login while authenticated
  if (isAuthenticated && pathname === PUBLIC_AUTH_ROUTES.LOGIN)
    return NextResponse.redirect(new URL(PUBLIC_ROUTES.HOME, request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}

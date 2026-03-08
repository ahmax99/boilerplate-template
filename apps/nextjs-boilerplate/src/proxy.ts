import { NextResponse } from 'next/server'

export function proxy() {
  // const sessionCookie = getSessionCookie(request)

  // if (!sessionCookie) {
  //   const loginUrl = new URL('/auth/login', request.url)
  //   loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)

  //   return NextResponse.redirect(loginUrl)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/blog/create']
}

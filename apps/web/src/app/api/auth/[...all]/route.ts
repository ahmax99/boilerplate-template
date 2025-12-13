import { type NextRequest, NextResponse } from 'next/server'

import { env } from '@/config/env'

const BACKEND_AUTH_URL = `${env.API_URL}/auth`

async function proxyHandler(request: NextRequest) {
  try {
    // Extract path after /api/auth/
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/auth', '')
    const targetUrl = `${BACKEND_AUTH_URL}${path}${url.search}`

    // Get request body for POST/PUT/PATCH
    let body: string | undefined
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = await request.text()
    }

    // Forward request to NestJS backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type':
          request.headers.get('Content-Type') || 'application/json',
        Cookie: request.headers.get('Cookie') || '',
        'User-Agent': request.headers.get('User-Agent') || '',
        Origin: env.NEXT_PUBLIC_BASE_URL
      },
      body,
      credentials: 'include'
    })

    // Get response body
    const responseBody = await response.text()

    // Extract Set-Cookie headers (critical for session management)
    const setCookieHeaders = response.headers.get('set-cookie')

    // Build response headers
    const responseHeaders = new Headers({
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    })

    // Forward Set-Cookie header if present
    if (setCookieHeaders) {
      responseHeaders.set('Set-Cookie', setCookieHeaders)
    }

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('Auth proxy error:', {
      method: request.method,
      url: request.url,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 })
  }
}

export {
  proxyHandler as GET,
  proxyHandler as POST,
  proxyHandler as PUT,
  proxyHandler as DELETE,
  proxyHandler as PATCH
}

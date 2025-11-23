import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { Session } from 'better-auth/types'
import ky from 'ky'

import { env } from '@/config/env'

const AUTH_URL = `${env.NEXT_PUBLIC_API_URL}/auth`

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/auth', '')
  const targetUrl = AUTH_URL + path + url.search

  try {
    const response = await ky.get(targetUrl, {
      headers: Object.fromEntries(request.headers.entries()),
      credentials: 'include'
    })

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch (error: unknown) {
    console.error('Auth proxy GET error:', {
      targetUrl,
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/auth', '')
  const targetUrl = AUTH_URL + path
  const body = await request.json()

  try {
    const response = await ky.post(targetUrl, {
      headers: Object.fromEntries(request.headers.entries()),
      json: body,
      credentials: 'include'
    })

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch (error: unknown) {
    console.error('Auth proxy POST error:', {
      targetUrl,
      body,
      error: error instanceof Error ? error.message : String(error)
    })

    // If it's an HTTP error from ky, forward the error response
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: Response }
      return new NextResponse(httpError.response.body, {
        status: httpError.response.status,
        statusText: httpError.response.statusText,
        headers: httpError.response.headers
      })
    }

    throw error
  }
}

export async function getSession() {
  const headersList = await headers()

  try {
    const data = await ky
      .get(`${AUTH_URL}/get-session`, {
        headers: Object.fromEntries(headersList.entries())
      })
      .json<{ session: Session }>()

    return data.session ?? null
  } catch {
    return null
  }
}

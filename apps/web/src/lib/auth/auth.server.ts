import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { Session } from 'better-auth/types'
import ky from 'ky'

import { env } from '@/config/env'

const AUTH_URL = `${env.NEXT_PUBLIC_BASE_URL}/api/auth`

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/auth', '')

  const response = await ky.get(AUTH_URL + path + url.search, {
    headers: Object.fromEntries(request.headers.entries())
  })

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/auth', '')
  const body = await request.json()

  const response = await ky.post(AUTH_URL + path, {
    headers: Object.fromEntries(request.headers.entries()),
    json: body
  })

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
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

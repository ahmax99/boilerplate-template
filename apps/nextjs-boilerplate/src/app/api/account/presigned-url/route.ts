import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { fetchPresignedUrl } from '@/features/account/server/api'

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const filename = searchParams.get('filename') as string
  const contentType = searchParams.get('contentType') as string

  const response = await fetchPresignedUrl({ filename, contentType })

  return NextResponse.json(response, { status: 200 })
}

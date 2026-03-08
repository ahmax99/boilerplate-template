import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { fetchPreSignedUrl } from '@/features/post/server/api'

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const filename = searchParams.get('filename') as string
  const contentType = searchParams.get('contentType') as string

  const response = await fetchPreSignedUrl({ filename, contentType })

  return NextResponse.json(response, { status: 200 })
}

import { type NextRequest, NextResponse } from 'next/server'

import { fetchPostImage } from '@/features/post/server/api'

export async function GET(request: NextRequest) {
  const imagePath = request.nextUrl.searchParams.get('path')

  if (!imagePath) return new NextResponse(null, { status: 400 })

  const upstream = await fetchPostImage(imagePath)
  const buffer = await upstream.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

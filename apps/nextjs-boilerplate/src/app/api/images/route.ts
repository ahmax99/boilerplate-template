import { type NextRequest, NextResponse } from 'next/server'

import { fetchImage } from '@/features/media/server/api'

export async function GET(request: NextRequest) {
  const imagePath = request.nextUrl.searchParams.get('path')

  if (!imagePath) return new NextResponse(null, { status: 400 })

  const upstream = await fetchImage(imagePath)

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

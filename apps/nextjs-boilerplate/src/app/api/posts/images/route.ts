import { type NextRequest, NextResponse } from 'next/server'

import { fetchPostImage } from '@/features/post/server/api'

export async function GET(request: NextRequest) {
  const imagePath = request.nextUrl.searchParams.get('path')

  if (!imagePath) return new NextResponse(null, { status: 400 })

  const buffer = await fetchPostImage(imagePath)

  return new NextResponse(buffer)
}

import { type NextRequest, NextResponse } from 'next/server'

import { fetchProfileImage } from '@/features/account/server/api'

export async function GET(request: NextRequest) {
  const imagePath = request.nextUrl.searchParams.get('path')

  if (!imagePath) return new NextResponse(null, { status: 400 })

  const buffer = await fetchProfileImage(imagePath)

  return new NextResponse(buffer)
}

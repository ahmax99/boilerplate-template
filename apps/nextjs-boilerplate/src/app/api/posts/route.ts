import { type NextRequest, NextResponse } from 'next/server'

import { createPostServer, fetchAllPosts } from '@/features/post/server/api'

export const GET = async () => {
  const response = await fetchAllPosts()

  return NextResponse.json(response, { status: 200 })
}

export const POST = async (request: NextRequest) => {
  const body = await request.json()

  const response = await createPostServer(body)

  return NextResponse.json(response, { status: 201 })
}

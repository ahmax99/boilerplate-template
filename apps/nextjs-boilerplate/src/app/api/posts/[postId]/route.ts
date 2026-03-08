import { NextResponse } from 'next/server'
import type { PostIdParams } from '@shared/config'

import { fetchPost } from '@/features/post/server/api'

export const GET = async ({
  params
}: {
  params: Promise<{ postId: PostIdParams['id'] }>
}) => {
  const { postId } = await params

  const response = await fetchPost(postId)

  return NextResponse.json(response, { status: 200 })
}

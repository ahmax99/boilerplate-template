import { NextResponse } from 'next/server'
import type { PostIdParams } from '@shared/config'

import { fetchPost } from '@/features/post/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const GET = withRequestLogging(
  async (
    _: Request,
    { params }: { params: Promise<{ postId: PostIdParams['id'] }> }
  ) => {
    const { postId } = await params

    const response = await fetchPost(postId)

    return NextResponse.json(response, { status: 200 })
  }
)

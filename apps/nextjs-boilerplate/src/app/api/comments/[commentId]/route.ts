import { NextResponse } from 'next/server'
import type { CommentIdParams } from '@shared/config'

import { deleteComment } from '@/features/comment/server/api'

export const DELETE = async ({
  params
}: {
  params: Promise<{ commentId: CommentIdParams['id'] }>
}) => {
  const { commentId } = await params

  const response = await deleteComment(commentId)

  return NextResponse.json(response, { status: 200 })
}

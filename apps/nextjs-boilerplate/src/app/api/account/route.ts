import { type NextRequest, NextResponse } from 'next/server'

import { deleteUser, updateUser } from '@/features/account/server/api'
import { getMe } from '@/features/auth/server/api'

export const PUT = async (request: NextRequest) => {
  const [body, user] = await Promise.all([request.json(), getMe()])
  const response = await updateUser(user.id, body)

  return NextResponse.json(response, { status: 200 })
}

export const DELETE = async () => {
  const user = await getMe()
  const response = await deleteUser(user.id)

  return NextResponse.json(response, { status: 200 })
}

import { NextResponse } from 'next/server'

import { handleLogout } from '@/features/auth/server/services/auth'

export const GET = async () => {
  const { logoutUrl } = await handleLogout()

  return NextResponse.redirect(logoutUrl)
}

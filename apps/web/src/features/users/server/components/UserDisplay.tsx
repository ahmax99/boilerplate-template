import { Badge } from '@repo/ui/components/atoms'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@repo/ui/components/molecules'

import { getCurrentSession } from '@/features/auth/server/api/getCurrentSession'

export async function UserDisplay() {
  const session = await getCurrentSession()

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage
          alt={session?.user?.name ?? 'User'}
          src={session?.user?.image ?? undefined}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Logged in as:</span>
        <Badge className="font-medium" variant="destructive">
          {session?.user?.name}
        </Badge>
      </div>
    </div>
  )
}

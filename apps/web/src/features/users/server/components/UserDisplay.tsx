import { Badge } from '@repo/ui/components/atoms'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@repo/ui/components/molecules'

import { getCurrentUser } from '@/features/auth/server/action'

export const UserDisplay = async () => {
  const user = await getCurrentUser()

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage
          alt={user?.name ?? 'User'}
          src={user?.image ?? undefined}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Logged in as:</span>
        <Badge className="font-medium" variant="destructive">
          {user?.name}
        </Badge>
      </div>
    </div>
  )
}

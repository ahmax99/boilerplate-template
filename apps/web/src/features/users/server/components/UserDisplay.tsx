import { Badge } from '@repo/ui/components/atoms'

import { USER_ID } from '../../constants'
import { fetchUser } from '../api/fetchUser'

export const UserDisplay = async () => {
  const user = await fetchUser({ id: USER_ID })

  return (
    <>
      <span className="text-sm text-muted-foreground">Logged in as:</span>
      <Badge className="font-medium" variant="secondary">
        {user.name}
      </Badge>
    </>
  )
}

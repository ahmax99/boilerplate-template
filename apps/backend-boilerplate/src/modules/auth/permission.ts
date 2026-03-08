import { AbilityBuilder } from '@casl/ability'

import { type AppAbility, createPrismaAbility } from '../../lib/casl-prisma.js'
import type { AuthUser } from './auth.plugin.js'

export const getUserPermissions = (user?: AuthUser, userId?: string) => {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

  // Public permissions (unauthenticated users)
  can('read', 'Post', { deletedAt: null })
  can('read', 'Comment', { deletedAt: null })

  if (!user) return build()

  // Authenticated users (Users group)
  if (user.role?.includes('Users') && userId) {
    can('create', 'Comment')
    can('update', 'Comment', { authorId: userId })
    can('delete', 'Comment', { authorId: userId })
  }

  // Admins (Admins group)
  if (user.role?.includes('Admins')) can('manage', 'all')

  return build()
}

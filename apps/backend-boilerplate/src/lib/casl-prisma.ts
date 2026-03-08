import type { PureAbility } from '@casl/ability'
import {
  createPrismaAbilityFor,
  type PrismaQueryOf,
  type Subjects
} from '@casl/prisma'
import type { Prisma } from '@shared/neon'

export { subject } from '@casl/ability'
export { accessibleBy, ParsingQueryError } from '@casl/prisma'

export const createPrismaAbility = createPrismaAbilityFor<Prisma.TypeMap>()

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

type AppSubjects =
  | 'all'
  | Subjects<{
      User: Prisma.UserGetPayload<object>
      Post: Prisma.PostGetPayload<object>
      Comment: Prisma.CommentGetPayload<object>
    }>

export type AppAbility = PureAbility<
  [Action, AppSubjects],
  PrismaQueryOf<Prisma.TypeMap>
>

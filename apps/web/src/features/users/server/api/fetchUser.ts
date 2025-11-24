'use server'

import { orpcServer } from '@/lib/api/orpc.server'

import type { FindUserInput } from '../../schemas/user.schema'

export const fetchUser = async ({ id }: FindUserInput) =>
  orpcServer.users.find({ id })

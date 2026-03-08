import type {
  CreateUserBody,
  UpdateUserBody,
  UserIdParams
} from '@shared/config'
import { prisma } from '@shared/neon'

import { catchAsyncError } from '../../error/utils/catchError.js'

export const UserService = {
  getAll: () =>
    catchAsyncError(
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ),

  getById: (id: UserIdParams['id']) =>
    catchAsyncError(
      prisma.user.findUnique({
        where: { id }
      })
    ),

  create: (input: CreateUserBody) =>
    catchAsyncError(
      prisma.user.create({
        data: input
      })
    ),

  update: (id: UserIdParams['id'], input: UpdateUserBody) =>
    catchAsyncError(
      prisma.user.update({
        where: { id },
        data: input
      })
    ),

  delete: (id: UserIdParams['id']) =>
    catchAsyncError(
      prisma.user.delete({
        where: { id }
      })
    )
} as const

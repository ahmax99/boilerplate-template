import type { CreateUserBody, User } from '@shared/config'

import { serverApiClient, serverAuthApiClient } from '@/lib/apiClient'

export const createUser = async (data: CreateUserBody, idToken: string) =>
  serverApiClient
    .post('/users', {
      json: data,
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    })
    .json<CreateUserBody>()

export const getMe = async () =>
  serverAuthApiClient.get('/users/me').json<User>()

import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'

import { appContract } from '../router.js'

import type { AppContract } from '../router.js'
import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'

const createORPCLink = (url: string, headers?: Record<string, string>) =>
  new OpenAPILink(appContract, {
    url,
    headers: headers || {
      'Content-Type': 'application/json'
    }
  })

export const orpcClientInstance = (
  url: string,
  headers?: Record<string, string>
): JsonifiedClient<ContractRouterClient<AppContract>> =>
  createORPCClient(createORPCLink(url, headers))

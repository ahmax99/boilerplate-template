import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import type { AppContract } from '@repo/contract'

declare global {
  var $client: JsonifiedClient<ContractRouterClient<AppContract>> | undefined
}

export type ORPCClient = JsonifiedClient<ContractRouterClient<AppContract>>

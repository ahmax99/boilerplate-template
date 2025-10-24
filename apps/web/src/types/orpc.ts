import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import type { appContract } from '@repo/contract'

declare global {
  var $orpcServer:
    | JsonifiedClient<ContractRouterClient<typeof appContract>>
    | undefined
}

export type ORPCClient = JsonifiedClient<
  ContractRouterClient<typeof appContract>
>

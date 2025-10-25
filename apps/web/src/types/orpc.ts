import type { ORPCClient } from '@repo/contract'

declare global {
  var $client: ORPCClient | undefined
}

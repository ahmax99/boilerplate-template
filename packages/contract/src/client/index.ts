import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'

import type { AppContract } from '../router.js'
import { appContract } from '../router.js'

export type ORPCClient = JsonifiedClient<ContractRouterClient<AppContract>>

export interface ServerClientConfig {
  url: string
  headers?: () => Promise<Record<string, string>> | Record<string, string>
}

export interface BrowserClientConfig {
  url: string
  headers?: Record<string, string>
  fetch?: typeof fetch
}

export function createServerClient(config: ServerClientConfig): ORPCClient {
  const link = new OpenAPILink(appContract, {
    url: config.url,
    headers: config.headers
  })

  return createORPCClient(link)
}

export function createBrowserClient(config: BrowserClientConfig): ORPCClient {
  const link = new OpenAPILink(appContract, {
    url: () => {
      if (globalThis.window === undefined)
        throw new TypeError(
          'Browser client cannot be used on the server side. Use createServerClient instead.'
        )

      return config.url
    },
    headers: config.headers,
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        credentials: 'include'
      })
  })

  return createORPCClient(link)
}

import 'server-only'

import { connection } from 'next/server'
import { Sha256 } from '@aws-crypto/sha256-js'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { SignatureV4 } from '@aws-sdk/signature-v4'

import { env } from '@/config/env'

let signer: SignatureV4 | null | undefined

const getSigner = () => {
  if (signer !== undefined) return signer
  signer =
    env.NODE_ENV === 'production'
      ? new SignatureV4({
          credentials: fromNodeProviderChain(),
          region: env.AWS_REGION,
          service: 'lambda',
          sha256: Sha256
        })
      : null
  return signer
}

export const signingHook = async ({ request }: { request: Request }) => {
  await connection()
  const signer = getSigner()
  if (!signer) return

  const url = new URL(request.url)
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  const bodyBytes = hasBody
    ? new Uint8Array(await request.arrayBuffer())
    : undefined

  const signed = await signer.sign({
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    hostname: url.hostname,
    path: url.pathname + url.search,
    body: bodyBytes,
    protocol: url.protocol
  })

  if (!hasBody) {
    for (const [key, value] of Object.entries(signed.headers))
      request.headers.set(key, value as string)

    return
  }

  return new Request(request.url, {
    method: request.method,
    headers: signed.headers as HeadersInit,
    body: bodyBytes as BodyInit,
    redirect: request.redirect,
    credentials: request.credentials,
    cache: request.cache
  })
}

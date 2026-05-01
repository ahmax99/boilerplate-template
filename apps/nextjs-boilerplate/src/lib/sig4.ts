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

  // Lambda Function URL with AWS_IAM auth requires `host` in SignedHeaders.
  // fetch/undici doesn't expose Host in request.headers (the kernel adds it),
  // so inject it explicitly so SignatureV4 includes it in the canonical request.
  const headersToSign: Record<string, string> = {
    host: url.host,
    ...Object.fromEntries(request.headers.entries())
  }

  const signed = await signer.sign({
    method: request.method,
    headers: headersToSign,
    hostname: url.hostname,
    path: url.pathname + url.search,
    body: bodyBytes,
    protocol: url.protocol
  })

  // Always emit a fresh Request: undici has a stream-state bug where reusing
  // the original request's signal/body refs triggers
  // "transformAlgorithm is not a function" on Node 22.
  // Drop `host` from the headers we set on the new Request — undici sets it
  // from the URL itself, and explicitly setting it can be ignored or rejected.
  const { host: _signedHost, ...outgoingHeaders } = signed.headers as Record<
    string,
    string
  >

  return new Request(request.url, {
    method: request.method,
    headers: outgoingHeaders,
    body: bodyBytes as BodyInit | undefined,
    redirect: request.redirect,
    credentials: request.credentials,
    cache: request.cache
  })
}

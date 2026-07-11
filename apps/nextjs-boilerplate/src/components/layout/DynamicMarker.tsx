import { connection } from 'next/server'
import { Suspense } from 'react'

// Signals that generateMetadata's runtime BASE_URL dependency is intentional,
// so routes with no other dynamic need (e.g. /_not-found) can still
// prerender their content while metadata resolves separately.
// https://nextjs.org/docs/messages/next-prerender-dynamic-metadata
async function Connection() {
  await connection()
  return null
}

function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  )
}

export { DynamicMarker }

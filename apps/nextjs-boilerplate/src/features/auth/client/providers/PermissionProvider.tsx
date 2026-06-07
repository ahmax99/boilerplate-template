'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createMongoAbility, type RawRuleOf } from '@casl/ability'
import { AbilityProvider as CaslAbilityProvider } from '@casl/react'
import { toast } from 'sonner'

import type { AppAbility } from '@/lib/casl'

export const AbilityProvider = ({
  rules,
  children
}: Readonly<{
  rules: RawRuleOf<AppAbility>[]
  children: React.ReactNode
}>) => {
  const ability = createMongoAbility<AppAbility>(rules)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!error) return

    toast.error(decodeURIComponent(error))
    const params = new URLSearchParams(searchParams.toString())
    params.delete('error')

    const query = params.size ? `?${params}` : ''
    router.replace(`${pathname}${query}`)
  }, [error, pathname, router, searchParams])

  return <CaslAbilityProvider value={ability}>{children}</CaslAbilityProvider>
}

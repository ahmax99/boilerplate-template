'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, useEffect } from 'react'
import { createMongoAbility, type RawRuleOf } from '@casl/ability'
import { createContextualCan } from '@casl/react'
import { toast } from 'sonner'

import type { AppAbility } from '@/lib/casl'

export const AbilityContext = createContext<AppAbility>(createMongoAbility())
export const Can = createContextualCan(AbilityContext.Consumer)

export function AbilityProvider({
  rules,
  children
}: Readonly<{
  rules: RawRuleOf<AppAbility>[]
  children: React.ReactNode
}>) {
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

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

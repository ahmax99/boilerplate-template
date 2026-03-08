'use client'

import { useEffect, useState } from 'react'

function ClientDynamic({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return <>{children}</>
}

export { ClientDynamic }

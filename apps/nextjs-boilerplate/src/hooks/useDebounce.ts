'use client'

import { useCallback, useRef } from 'react'

interface UseDebounceInterface {
  callback: () => void
  delay: number
}

export const useDebounce = ({ callback, delay }: UseDebounceInterface) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => callback(), delay)
  }, [callback, delay])
}

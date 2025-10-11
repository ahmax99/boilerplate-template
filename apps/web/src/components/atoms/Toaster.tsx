'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

export function Toaster({ ...props }: Readonly<ToasterProps>) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      className="bg-popover text-popover-foreground rounded-lg"
      theme={theme as ToasterProps['theme']}
      {...props}
    />
  )
}

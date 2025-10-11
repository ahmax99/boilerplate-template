'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

const switchBase =
  // layout
  'inline-flex h-6 w-10 shrink-0 items-center rounded-full cursor-pointer ' +
  // colors & transitions
  'border-2 border-transparent transition-all ' +
  // states
  'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input '

const thumbBase =
  // layout
  'pointer-events-none block size-5 rounded-full ' +
  // colors
  'bg-background shadow-xs ring-0 ' +
  // transitions
  'transition-transform ' +
  // states
  'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 ' +
  // RTL support
  'data-[state=checked]:rtl:-translate-x-4'

export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(switchBase, className)}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb className={thumbBase} data-slot="switch-thumb" />
    </SwitchPrimitive.Root>
  )
}

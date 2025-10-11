'use client'

import * as React from 'react'

import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib/utils'

const popoverContentBase =
  // layout & animation
  'z-50 origin-(--radix-popover-content-transform-origin) rounded-md border shadow-md outline-hidden ' +
  // colors
  'bg-popover text-popover-foreground ' +
  // animations
  'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ' +
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ' +
  // slide animations based on side
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 ' +
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

export function Popover({
  ...props
}: Readonly<React.ComponentProps<typeof PopoverPrimitive.Root>>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

export function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(popoverContentBase, className)}
        data-slot="popover-content"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

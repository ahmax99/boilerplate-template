'use client'

import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

const labelBase =
  // layout & positioning
  'gap-md flex items-center ' +
  // typography
  'text-sm leading-none font-medium ' +
  // interaction
  'select-none ' +
  // disabled states
  'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 ' +
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(labelBase, className)}
      data-slot="label"
      {...props}
    />
  )
}

export { Label }

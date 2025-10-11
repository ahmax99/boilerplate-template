import { cn } from '@/lib/utils'

const inputBase =
  // layout & sizing
  'flex h-9 w-full min-w-0 ' +
  // appearance
  'rounded-md border shadow-xs ' +
  // padding & typography
  'px-3 py-1 text-base md:text-sm ' +
  // colors & theming
  'border-input dark:bg-input/30 bg-transparent ' +
  // text selection
  'selection:bg-primary selection:text-primary-foreground ' +
  // placeholder
  'placeholder:text-muted-foreground ' +
  // file input styling
  'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium ' +
  // focus
  'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-1 ' +
  // validation
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ' +
  // disabled
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ' +
  // transitions
  'transition-[color,box-shadow]'

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(inputBase, className)}
      data-slot="input"
      type={type}
      {...props}
    />
  )
}

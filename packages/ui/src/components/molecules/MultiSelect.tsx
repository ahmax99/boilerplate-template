'use client'

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge, Button } from '../atoms'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from './Command'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'

interface MultiSelectContextType {
  open: boolean
  setOpen: (open: boolean) => void
  selectedValues: Set<string>
  toggleValue: (value: string) => void
  items: Map<string, ReactNode>
  onItemAdded: (value: string, label: ReactNode) => void
}
const MultiSelectContext = createContext<MultiSelectContextType | null>(null)

interface MultiSelectProps {
  children: ReactNode
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
}

function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange
}: Readonly<MultiSelectProps>) {
  const [open, setOpen] = useState(false)
  const [internalValues, setInternalValues] = useState(
    new Set<string>(values ?? defaultValues)
  )
  const selectedValues = values ? new Set(values) : internalValues
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map())

  const toggleValue = useCallback(
    (value: string) => {
      const getNewSet = (prev: Set<string>) => {
        const newSet = new Set(prev)
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          newSet.add(value)
        }
        return newSet
      }
      setInternalValues(getNewSet)
      onValuesChange?.([...getNewSet(selectedValues)])
    },
    [selectedValues, onValuesChange]
  )

  const onItemAdded = useCallback(
    (value: string, label: ReactNode) =>
      setItems((prev) => {
        if (prev.get(value) === label) return prev
        return new Map(prev).set(value, label)
      }),
    []
  )

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedValues,
      toggleValue,
      items,
      onItemAdded
    }),
    [open, selectedValues, toggleValue, items, onItemAdded]
  )

  return (
    <MultiSelectContext value={contextValue}>
      <Popover modal={true} onOpenChange={setOpen} open={open}>
        {children}
      </Popover>
    </MultiSelectContext>
  )
}

function MultiSelectTrigger({
  className,
  children,
  ...props
}: {
  className?: string
  children?: ReactNode
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext()

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        aria-expanded={props['aria-expanded'] ?? open}
        className={cn(
          "flex h-auto min-h-9 w-fit items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-transparent px-3 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
          className
        )}
        role={props.role ?? 'combobox'}
        variant={props.variant ?? 'outline'}
      >
        {children}
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  )
}

function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  overflowBehavior = 'wrap-when-open',
  ...props
}: {
  placeholder?: string
  clickToRemove?: boolean
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff'
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>) {
  const { selectedValues, toggleValue, items, open } = useMultiSelectContext()
  const [overflowAmount, setOverflowAmount] = useState(0)
  const valueRef = useRef<HTMLDivElement>(null)
  const overflowRef = useRef<HTMLDivElement>(null)

  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open)

  const checkOverflow = useCallback(() => {
    if (valueRef.current == null) return

    const containerElement = valueRef.current
    const overflowElement = overflowRef.current
    const items = containerElement.querySelectorAll<HTMLElement>(
      '[data-selected-item]'
    )

    if (overflowElement != null) overflowElement.style.display = 'none'
    for (const child of items) child.style.removeProperty('display')

    let amount = 0
    for (let i = items.length - 1; i >= 0; i--) {
      const child = items[i]
      if (!child) continue
      if (containerElement.scrollWidth <= containerElement.clientWidth) break

      amount = items.length - i
      child.style.display = 'none'
      overflowElement?.style.removeProperty('display')
    }
    setOverflowAmount(amount)
  }, [])

  const handleResize = useCallback(
    (node: HTMLDivElement) => {
      valueRef.current = node

      const observer = new ResizeObserver(checkOverflow)
      observer.observe(node)

      return () => {
        observer.disconnect()
        valueRef.current = null
      }
    },
    [checkOverflow]
  )

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className="min-w-0 overflow-hidden font-normal text-muted-foreground">
        {placeholder}
      </span>
    )
  }

  return (
    <div
      {...props}
      className={cn(
        'flex w-fit gap-1.5 overflow-hidden',
        shouldWrap && 'h-full flex-wrap',
        className
      )}
      ref={handleResize}
    >
      {[...selectedValues]
        .filter((value) => items.has(value))
        .map((value) => (
          <Badge
            className="group flex items-center gap-1"
            data-selected-item
            key={value}
            onClick={
              clickToRemove
                ? (e) => {
                    e.stopPropagation()
                    toggleValue(value)
                  }
                : undefined
            }
            variant="outline"
          >
            {items.get(value)}
            {clickToRemove && (
              <XIcon className="size-2 text-muted-foreground group-hover:text-destructive" />
            )}
          </Badge>
        ))}
      <Badge
        ref={overflowRef}
        style={{
          display: overflowAmount > 0 && !shouldWrap ? 'block' : 'none'
        }}
        variant="outline"
      >
        +{overflowAmount}
      </Badge>
    </div>
  )
}

function MultiSelectContent({
  search = true,
  children,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string }
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<typeof Command>, 'children'>) {
  const canSearch = typeof search === 'object' ? true : search

  return (
    <>
      <div style={{ display: 'none' }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command {...props}>
          {canSearch ? (
            <CommandInput
              placeholder={
                typeof search === 'object' ? search.placeholder : undefined
              }
            />
          ) : (
            <button className="sr-only" type="button" />
          )}
          <CommandList>
            {canSearch && (
              <CommandEmpty>
                {typeof search === 'object' ? search.emptyMessage : undefined}
              </CommandEmpty>
            )}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  )
}

function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode
  value: string
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, 'value'>) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext()
  const isSelected = selectedValues.has(value)

  useEffect(
    () => onItemAdded(value, badgeLabel ?? children),
    [value, children, onItemAdded, badgeLabel]
  )

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value)
        onSelect?.(value)
      }}
    >
      <CheckIcon
        className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      {children}
    </CommandItem>
  )
}

function MultiSelectGroup(
  props: Readonly<ComponentPropsWithoutRef<typeof CommandGroup>>
) {
  return <CommandGroup {...props} />
}

function MultiSelectSeparator(
  props: Readonly<ComponentPropsWithoutRef<typeof CommandSeparator>>
) {
  return <CommandSeparator {...props} />
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext)
  if (context == null)
    throw new Error(
      'useMultiSelectContext must be used within a MultiSelectContext'
    )

  return context
}

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectGroup,
  MultiSelectSeparator,
  useMultiSelectContext
}

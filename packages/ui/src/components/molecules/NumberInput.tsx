import { cn } from '../../lib/utils'
import { Input } from '../atoms'

function NumberInput({
  onChange,
  value,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'type' | 'onChange' | 'value'> & {
  onChange: (value: number | null) => void
  value: undefined | null | number
}) {
  return (
    <Input
      {...props}
      onChange={(e) => {
        const number = e.target.valueAsNumber
        onChange(Number.isNaN(number) ? null : number)
      }}
      type="number"
      value={value ?? ''}
    />
  )
}

function InputGroupNumberInput({
  className,
  ...props
}: React.ComponentProps<typeof NumberInput>) {
  return (
    <NumberInput
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        className
      )}
      data-slot="input-group-control"
      {...props}
    />
  )
}

export { NumberInput, InputGroupNumberInput }

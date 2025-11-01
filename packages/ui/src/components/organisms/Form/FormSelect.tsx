import { useFieldContext } from '../../../hooks'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '../../molecules'
import { FormBase, type FormControlProps } from './FormBase'

function FormSelect({
  children,
  ...props
}: FormControlProps & { children: React.ReactNode }) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Select
        onValueChange={(e) => field.handleChange(e)}
        value={field.state.value}
      >
        <SelectTrigger
          aria-invalid={isInvalid}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormBase>
  )
}

export { FormSelect }

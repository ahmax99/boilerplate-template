import { useFieldContext } from '../../../hooks'
import { Textarea } from '../../atoms'
import { FormBase, type FormControlProps } from './FormBase'

export function FormTextarea(props: Readonly<FormControlProps>) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Textarea
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      />
    </FormBase>
  )
}

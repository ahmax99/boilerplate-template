import { useFieldContext } from '../../../hooks'
import { Input } from '../../atoms'
import { FormBase, type FormControlProps } from './FormBase'

function FormInput(props: Readonly<FormControlProps>) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Input
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

export { FormInput }

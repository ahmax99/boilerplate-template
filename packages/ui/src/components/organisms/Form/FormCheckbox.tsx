import { useFieldContext } from '../../../hooks'
import { Checkbox } from '../../atoms'
import { FormBase, type FormControlProps } from './FormBase'

function FormCheckbox(props: Readonly<FormControlProps>) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props} controlFirst horizontal>
      <Checkbox
        aria-invalid={isInvalid}
        checked={field.state.value}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(e) => field.handleChange(e === true)}
      />
    </FormBase>
  )
}

export { FormCheckbox }

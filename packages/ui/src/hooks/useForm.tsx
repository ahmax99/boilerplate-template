import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea
} from '../components/organisms/Form'

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    Checkbox: FormCheckbox
  },
  formComponents: {},
  fieldContext,
  formContext
})

export { useAppForm, useFieldContext, useFormContext }

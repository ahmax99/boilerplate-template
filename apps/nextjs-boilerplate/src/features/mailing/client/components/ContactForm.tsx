'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button, Input, Textarea } from '@/components/atoms'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSwap
} from '@/components/molecules'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle
} from '@/components/organisms/Field'

import {
  ContactFormModel,
  type ContactFormSchema
} from '../../schemas/contactForm.schema'
import { useContactActions } from '../hooks/useContactActions'

export interface FieldConfig {
  name: keyof ContactFormSchema
  label: string
  description: string
}

export interface ContactFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: ContactFormSchema
}

interface ContactFormProps {
  config: ContactFormConfig
}

export const ContactForm = ({ config }: Readonly<ContactFormProps>) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormSchema>({
    resolver: zodResolver(ContactFormModel.contact),
    defaultValues: config.defaultValues
  })
  const { handleSendContact } = useContactActions()

  const renderFieldInput = (field: FieldConfig) => {
    const fieldError = errors[field.name]

    if (field.name === 'message') {
      return (
        <Textarea
          id={field.name}
          placeholder={field.description}
          rows={5}
          {...register(field.name)}
          aria-invalid={!!fieldError}
        />
      )
    }

    return (
      <Input
        id={field.name}
        placeholder={field.description}
        type={field.name === 'email' ? 'email' : 'text'}
        {...register(field.name)}
        aria-invalid={!!fieldError}
      />
    )
  }

  const onSubmit = async (data: ContactFormSchema) =>
    await handleSendContact(data)

  return (
    <Card className="w-full sm:max-w-96">
      <CardHeader className="font-bold text-2xl">
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {config.fields.map((field) => {
            const fieldError = errors[field.name]

            return (
              <Field key={field.name}>
                <FieldLabel
                  className="flex items-center justify-between"
                  htmlFor={field.name}
                >
                  <FieldTitle>{field.label}</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  {renderFieldInput(field)}
                  <FieldError errors={fieldError ? [fieldError] : []} />
                </FieldContent>
              </Field>
            )
          })}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            <LoadingSwap isLoading={isSubmitting}>
              {config.submitLabel}
            </LoadingSwap>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

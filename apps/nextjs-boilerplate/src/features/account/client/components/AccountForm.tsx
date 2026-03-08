'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button, Input } from '@/components/atoms'
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

import { useAccountActions } from '../../client/hooks/useAccountActions'
import {
  AccountFormModel,
  type UpdateProfileSchema
} from '../../schemas/accountForm.schema'

export interface FieldConfig {
  name: 'name' | 'image'
  label: string
  description: string
}

export interface AccountFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: UpdateProfileSchema
}

interface AccountFormProps {
  config: AccountFormConfig
}

export const AccountForm = ({ config }: Readonly<AccountFormProps>) => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(AccountFormModel.updateProfile),
    defaultValues: config.defaultValues
  })
  const { handleUpdateProfile } = useAccountActions()

  const renderFieldInput = (field: FieldConfig) => {
    const fieldError = errors[field.name as keyof typeof errors]

    if (field.name === 'image') {
      return (
        <Input
          accept="image/*"
          aria-invalid={!!fieldError}
          id={field.name}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setImageFile(file)
          }}
          type="file"
        />
      )
    } else {
      return (
        <Input
          id={field.name}
          placeholder={field.description}
          type="text"
          {...register(field.name)}
          aria-invalid={!!fieldError}
        />
      )
    }
  }

  const onSubmit = async (data: UpdateProfileSchema) =>
    await handleUpdateProfile(data, imageFile, () => {
      reset()
      setImageFile(null)
    })

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
            const fieldError = errors[field.name as keyof typeof errors]

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

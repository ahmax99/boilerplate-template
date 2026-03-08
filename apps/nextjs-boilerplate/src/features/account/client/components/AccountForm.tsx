'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button, Checkbox, Input } from '@/components/atoms'
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
import { PasswordInput } from '@/components/organisms/PasswordInput'

import {
  type ChangePasswordSchema,
  changePasswordSchema,
  type UpdateProfileSchema,
  updateProfileSchema
} from '../../schemas/accountForm.schema'

type AccountFormSchema = UpdateProfileSchema | ChangePasswordSchema
type AccountFormMode = 'update-profile' | 'change-password'

export interface FieldConfig {
  name:
    | 'name'
    | 'email'
    | 'currentPassword'
    | 'newPassword'
    | 'revokeOtherSessions'
  label: string
  description: string
}

export interface AccountFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: AccountFormSchema
}

interface AccountFormProps {
  mode: AccountFormMode
  config: AccountFormConfig
  user: // | NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>['user']
    | {
        name: string
        email: string
      } // TODO: Replace with actual user type from your auth system
    | null
}

const getSchemaByMode = (
  mode: AccountFormMode
): typeof updateProfileSchema | typeof changePasswordSchema => {
  switch (mode) {
    case 'update-profile':
      return updateProfileSchema
    case 'change-password':
      return changePasswordSchema
  }
}

export const AccountForm = ({
  mode,
  config,
  user
}: Readonly<AccountFormProps>) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormSchema>({
    resolver: zodResolver(getSchemaByMode(mode)),
    defaultValues: config.defaultValues
  })
  // const { handleUpdateProfile, handleChangePassword } = useAccountActions()

  const renderFieldInput = (field: FieldConfig) => {
    const fieldError = errors[field.name as keyof typeof errors]

    switch (field.name) {
      case 'currentPassword':
      case 'newPassword':
        return (
          <PasswordInput
            id={field.name}
            placeholder={field.description}
            {...register(field.name)}
            aria-invalid={!!fieldError}
          />
        )
      case 'revokeOtherSessions':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.name} {...register(field.name)} />
            <FieldLabel>{field.description}</FieldLabel>
          </div>
        )
      default:
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
  }

  const onSubmit = async (data: AccountFormSchema) => {
    switch (mode) {
      case 'update-profile':
        // await handleUpdateProfile(data as UpdateProfileSchema, {
        //   name: user?.name ?? '',
        //   email: user?.email ?? ''
        // })
        break
      case 'change-password':
        // await handleChangePassword(data as ChangePasswordSchema)
        break
    }
  }

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

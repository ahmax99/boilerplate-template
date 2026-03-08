'use client'

import { useState } from 'react'
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
  type CreateBlogSchema,
  PostFormModel
} from '../../schemas/postForm.schema'
import { usePostActions } from '../hooks/usePostActions'

type PostFormSchema = CreateBlogSchema

export interface FieldConfig {
  name: 'title' | 'content' | 'image'
  label: string
  description: string
}

export interface PostFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: PostFormSchema
}

interface PostFormProps {
  config: PostFormConfig
  user: // | NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>['user']
    | {
        id: string
        email: string
        name: string
      } // TODO: Replace with actual user type when available
    | null
}

export const PostForm = ({ config, user }: Readonly<PostFormProps>) => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { handleCreatePost } = usePostActions()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PostFormSchema>({
    resolver: zodResolver(PostFormModel.createBlog),
    defaultValues: config.defaultValues
  })

  const renderFieldInput = (field: FieldConfig) => {
    const fieldError = errors[field.name as keyof typeof errors]

    switch (field.name) {
      case 'content':
        return (
          <Textarea
            id={field.name}
            placeholder={field.description}
            {...register(field.name)}
            aria-invalid={!!fieldError}
          />
        )
      case 'image':
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
      default:
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

  const onSubmit = async (data: PostFormSchema) =>
    handleCreatePost(
      {
        title: data.title,
        content: data.content,
        slug: data.title.toLowerCase().replaceAll(/\s+/g, '-'),
        imageUrl: data.image,
        authorId: user?.id ?? ''
      },
      imageFile,
      () => {
        reset()
        setImageFile(null)
      }
    )

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

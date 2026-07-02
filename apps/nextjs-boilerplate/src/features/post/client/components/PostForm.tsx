'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from '@shared/config'
import { useForm } from 'react-hook-form'

import { Input, Textarea } from '@/components/atoms'
import { FormCard, FormField } from '@/components/organisms'

import {
  type CreatePostSchema,
  PostFormModel
} from '../../schemas/postForm.schema'
import { usePostActions } from '../hooks/usePostActions'

type PostFormSchema = CreatePostSchema

export interface FieldConfig {
  name: 'title' | 'content' | 'image'
  label: string
  description: string
}

interface PostFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: PostFormSchema
}

interface PostFormProps {
  config: PostFormConfig
  user: User
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
    resolver: zodResolver(PostFormModel.createPost),
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
        imagePath: data.image,
        authorId: user.id
      },
      imageFile,
      () => {
        reset()
        setImageFile(null)
      }
    )

  return (
    <FormCard
      description={config.description}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={config.submitLabel}
      title={config.title}
    >
      {config.fields.map((field) => (
        <FormField
          error={errors[field.name as keyof typeof errors]}
          key={field.name}
          label={field.label}
          name={field.name}
        >
          {renderFieldInput(field)}
        </FormField>
      ))}
    </FormCard>
  )
}

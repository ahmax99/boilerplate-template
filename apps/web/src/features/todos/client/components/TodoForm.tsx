'use client'

import { FieldGroup } from '@repo/ui/components/organisms'

interface TodoFormProps {
  // biome-ignore lint/suspicious/noExplicitAny: type safety maintained at usage site
  readonly form: any
  readonly onSubmit: (e: React.FormEvent) => void
  readonly submitButton: React.ReactNode
  readonly cancelButton?: React.ReactNode
}

export function TodoForm({
  form,
  onSubmit,
  submitButton,
  cancelButton
}: TodoFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <form.AppField name="title">
          {/* biome-ignore lint/suspicious/noExplicitAny: type safety maintained at usage site */}
          {(field: any) => <field.Input label="Title" />}
        </form.AppField>

        <form.AppField name="description">
          {/* biome-ignore lint/suspicious/noExplicitAny: type safety maintained at usage site */}
          {(field: any) => (
            <field.Textarea
              description="Optional description for your todo"
              label="Description"
            />
          )}
        </form.AppField>

        <div className="flex gap-2">
          {submitButton}
          {cancelButton}
        </div>
      </FieldGroup>
    </form>
  )
}

import { z } from 'zod'

const emailUserSchema = z.object({
  email: z.email(),
  name: z.string()
})

export const EmailModel = {
  user: emailUserSchema,
  send: z.object({
    user: emailUserSchema,
    url: z.url()
  })
}

export type EmailUser = z.infer<typeof EmailModel.user>
export type SendEmail = z.infer<typeof EmailModel.send>

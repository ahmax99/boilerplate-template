import { z } from 'zod'

export const AuthModel = {
  session: z.object({
    userId: z.string().optional(),
    email: z.string().optional(),
    refreshToken: z.string().optional(),
    codeVerifier: z.string().optional(),
    state: z.string().optional(),
    nonce: z.string().optional(),
    callbackUrl: z.string().optional()
  }),
  callbackParams: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional()
  })
}

export type SessionData = z.infer<typeof AuthModel.session>
export type CallbackParams = z.infer<typeof AuthModel.callbackParams>

import 'server-only'

import type { SendEmail } from '../../schemas/email.schema'
import { PasswordResetEmail } from '../components/PasswordResetEmail'
import { sendEmail } from '../utils/sendEmail'

type SendPasswordResetEmailParams = SendEmail

export const sendPasswordResetEmail = async ({
  user,
  url
}: SendPasswordResetEmailParams) =>
  sendEmail({
    user,
    subject: 'Reset Your Password',
    react: PasswordResetEmail({
      userName: user.name,
      resetUrl: url
    })
  })

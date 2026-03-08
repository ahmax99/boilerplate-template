import 'server-only'

import type { SendEmail } from '../../schemas/email.schema'
import { VerificationEmail } from '../components/VerificationEmail'
import { sendEmail } from '../utils/sendEmail'

type SendVerificationEmailParams = SendEmail

export const sendVerificationEmail = async ({
  user,
  url
}: SendVerificationEmailParams) =>
  sendEmail({
    user,
    subject: 'Verify Your Email',
    react: VerificationEmail({
      userName: user.name,
      verificationUrl: url
    })
  })

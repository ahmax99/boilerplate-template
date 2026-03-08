import Link from 'next/link'
import { Mail } from 'lucide-react'

import { PageTemplate } from '@/components/layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/molecules/Card'
import { EmailVerificationButton } from '@/features/auth/client/components/EmailVerificationButton'
import { PUBLIC_ROUTES } from '@/features/auth/constants/routes'
import type { EmailUser } from '@/features/mailing/schemas/email.schema'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Verify Your Email',
  description:
    'Check your inbox and verify your email address to activate your account',
  urlPath: 'auth/register/email-verify'
})

interface EmailVerifyPageProps {
  searchParams: Promise<{ email: EmailUser['email'] }>
}

export default async function EmailVerifyPage({
  searchParams
}: Readonly<EmailVerifyPageProps>) {
  const { email } = await searchParams

  return (
    <PageTemplate alignment="center" fullHeight>
      <Card className="w-full sm:max-w-96">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification email to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center text-sm">
            <p className="mb-2 text-muted-foreground">
              Please check your inbox and click the verification link to
              activate your account.
            </p>
            <p className="text-muted-foreground text-xs">
              Don't forget to check your spam folder if you don't see the email.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="flex flex-col gap-2 text-center text-muted-foreground text-sm">
            <span>Still can't find the email?</span>
            <EmailVerificationButton email={email} />
          </p>

          <p className="flex gap-2 text-center text-muted-foreground text-sm">
            <span>Need help?</span>
            <Link
              className="font-medium text-primary"
              href={PUBLIC_ROUTES.CONTACT_US}
            >
              Contact Us
            </Link>
          </p>
        </CardFooter>
      </Card>
    </PageTemplate>
  )
}

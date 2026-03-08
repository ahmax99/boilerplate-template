import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components'

interface PasswordResetEmailProps {
  userName: string
  resetUrl: string
}

export const PasswordResetEmail = ({
  userName,
  resetUrl
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password - Action required</Preview>
    <Tailwind>
      <Body className="bg-[#fcfcfc] font-sans">
        <Container className="mx-auto max-w-xl px-4 py-8">
          <Section className="rounded-lg bg-white p-8 shadow-sm">
            <Text className="mb-4 font-bold text-2xl text-black">
              Password Reset Request
            </Text>
            <Text className="mb-4 text-base text-black">Hi {userName},</Text>
            <Text className="mb-4 text-base text-black">
              You requested to reset your password. Click the button below to
              create a new password:
            </Text>
            <Section className="my-8 text-center">
              <Button
                className="inline-block rounded-md bg-black px-6 py-3 font-semibold text-white no-underline"
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="mb-2 text-[#525252] text-sm">
              Or copy and paste this link into your browser:
            </Text>
            <Link className="break-all text-blue-600 text-sm" href={resetUrl}>
              {resetUrl}
            </Link>
            <Section className="mt-8 border-[#e4e4e4] border-t pt-8">
              <Text className="mb-2 text-[#525252] text-sm">
                If you didn&apos;t request this password reset, you can safely
                ignore this email. Your password will remain unchanged.
              </Text>
              <Text className="text-[#525252] text-sm">
                This link will expire in 1 hour for security reasons.
              </Text>
            </Section>
          </Section>
          <Section className="mt-4 text-center">
            <Text className="text-[#525252] text-xs">
              This is an automated message, please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)

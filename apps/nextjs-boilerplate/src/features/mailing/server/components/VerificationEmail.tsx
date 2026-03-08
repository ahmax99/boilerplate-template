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

interface VerificationEmailProps {
  userName: string
  verificationUrl: string
}

export const VerificationEmail = ({
  userName,
  verificationUrl
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address - Action required</Preview>
    <Tailwind>
      <Body className="bg-[#fcfcfc] font-sans">
        <Container className="mx-auto max-w-xl px-4 py-8">
          <Section className="rounded-lg bg-white p-8 shadow-sm">
            <Text className="mb-4 font-bold text-2xl text-black">
              Verify Your Email Address
            </Text>
            <Text className="mb-4 text-base text-black">Hi {userName},</Text>
            <Text className="mb-4 text-base text-black">
              Thank you for signing up! Please verify your email address by
              clicking the button below:
            </Text>
            <Section className="my-8 text-center">
              <Button
                className="inline-block rounded-md bg-black px-6 py-3 font-semibold text-white no-underline"
                href={verificationUrl}
              >
                Verify Email Address
              </Button>
            </Section>
            <Text className="mb-2 text-[#525252] text-sm">
              Or copy and paste this link into your browser:
            </Text>
            <Link
              className="break-all text-blue-600 text-sm"
              href={verificationUrl}
            >
              {verificationUrl}
            </Link>
            <Section className="mt-8 border-[#e4e4e4] border-t pt-8">
              <Text className="mb-2 text-[#525252] text-sm">
                If you didn&apos;t create an account, you can safely ignore this
                email.
              </Text>
              <Text className="text-[#525252] text-sm">
                This verification link will expire in 24 hours for security
                reasons.
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

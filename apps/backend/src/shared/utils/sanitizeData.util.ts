const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'sessionToken',
  'creditCard',
  'ssn',
  'cvv',
  'pin'
] as const

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g

export const sanitizeData = (data: unknown): unknown => {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') return maskSensitiveString(data)

  if (Array.isArray(data)) return data.map((item) => sanitizeData(item))

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()

      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]'
      } else if (lowerKey.includes('email')) {
        sanitized[key] = maskEmail(String(value))
      } else {
        sanitized[key] = sanitizeData(value)
      }
    }

    return sanitized
  }

  return data
}

const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return email

  const [localPart, domain] = email.split('@')
  if (!domain || !localPart) return email

  const maskedLocal =
    localPart.length > 2
      ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart.at(-1)}`
      : `${localPart[0]}*`

  return `${maskedLocal}@${domain}`
}

const maskSensitiveString = (str: string): string => {
  let masked = str

  masked = masked.replaceAll(EMAIL_REGEX, (email) => maskEmail(email))

  masked = masked.replaceAll(IP_REGEX, (ip) => {
    const parts = ip.split('.')
    return `${parts[0]}.${parts[1]}.***.***`
  })

  return masked
}

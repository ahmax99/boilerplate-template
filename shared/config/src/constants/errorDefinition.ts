interface ErrorDefinition {
  status: number
  message: string
}

export const ERROR_DEFINITIONS = {
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  FORBIDDEN: {
    status: 403,
    message: 'You do not have permission to perform this action'
  },
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  BAD_REQUEST: { status: 400, message: 'Bad request' },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: 'Rate limit exceeded. Please try again later.'
  },
  BOT_DETECTED: {
    status: 429,
    message: 'Bot detected. Please try again later.'
  },
  INVALID_EMAIL: {
    status: 400,
    message: 'Invalid email address. Please use a valid email.'
  },
  DISPOSABLE_EMAIL: {
    status: 400,
    message: 'Disposable email addresses are not allowed.'
  },
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred' }
} satisfies Record<string, ErrorDefinition>

export type ErrorCode = keyof typeof ERROR_DEFINITIONS

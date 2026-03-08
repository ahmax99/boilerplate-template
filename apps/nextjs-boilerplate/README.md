# Next.js Boilerplate

Modern full-stack Next.js application with authentication, authorization, and file uploads.

## Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:
```env
# AWS Configuration
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-bucket-name"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"

# Email
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"
CONTACT_TO_EMAIL="contact@yourdomain.com"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

## Development

Start the development server:
```bash
bun run dev
```

The application runs at `http://localhost:3000`

Build for production:
```bash
bun run build
```

Start production server:
```bash
bun run start
```

Type checking:
```bash
bun run check-types
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── features/         # Feature-specific modules
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries and configurations
├── styles/          # Global styles and Tailwind config
└── utils/           # Helper functions
```

## Key Features

### Authentication
Built with Better Auth, supporting:
- Email/password authentication
- OAuth providers (Google, GitHub)
- Session management
- Password reset flows

### Authorization
CASL-based permissions system:
- Role-based access control
- Resource-level permissions
- Client and server-side enforcement

### File Uploads
S3 integration for secure file uploads:
- Presigned URL generation
- Client-side direct uploads
- Image optimization

### Email Templates
React Email components for:
- Welcome emails
- Password reset
- Notifications

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [CASL Documentation](https://casl.js.org/v6/en/guide/intro)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

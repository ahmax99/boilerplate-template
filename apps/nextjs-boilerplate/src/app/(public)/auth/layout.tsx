import { ErrorScreenProvider } from '@/features/error/client/providers/ErrorScreenProvider'

export default function AuthProcessLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ErrorScreenProvider />
      {children}
    </>
  )
}

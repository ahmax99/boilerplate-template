export default function AuthProcessLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  )
}

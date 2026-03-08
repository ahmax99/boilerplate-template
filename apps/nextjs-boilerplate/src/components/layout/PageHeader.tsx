'use client'

import Link from 'next/link'

import { PUBLIC_ROUTES } from '@/features/auth/constants/routes'

import { Logo } from '../molecules'

function PageHeader() {
  // const { data } = authClient.useSession()
  // const permissions = getUserPermissions(data?.user)

  const navItems = [
    { name: 'Blog', href: PUBLIC_ROUTES.BLOG },
    { name: 'Create', href: PUBLIC_ROUTES.BLOG_POST, adminAuth: true },
    { name: 'Contact', href: PUBLIC_ROUTES.CONTACT_US }
  ]

  return (
    <header className="px-4 md:px-6">
      <nav className="flex h-16 justify-between gap-4">
        <div className="flex gap-2">
          <div className="flex items-center gap-6">
            <Link href={PUBLIC_ROUTES.HOME}>
              <Logo />
            </Link>

            <nav className="hidden gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  aria-disabled={
                    // item.adminAuth && !permissions.can('create', 'Post')
                    false
                  }
                  className={
                    // item.adminAuth && !permissions.can('create', 'Post')
                    //   ? 'cursor-not-allowed text-muted-foreground opacity-50'
                    //   : 'hover:text-primary'
                    'hover:text-primary'
                  }
                  href={item.href}
                  key={item.name}
                  // onNavigate={(e) => {
                  //   if (item.adminAuth && !permissions.can('create', 'Post'))
                  //     e.preventDefault()
                  // }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          {data?.session ? (
            <>
              <ButtonLink href={PROTECTED_ROUTES.ACCOUNT}>
                Go to Account
              </ButtonLink>
              <LogoutButton />
            </>
          ) : (
            <ButtonLink href={PUBLIC_AUTH_ROUTES.LOGIN}>Sign In</ButtonLink>
          )}
        </div> */}
      </nav>
    </header>
  )
}

export { PageHeader }

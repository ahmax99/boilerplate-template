'use client'

import Link from 'next/link'

import { PUBLIC_ROUTES } from '@/lib/routes'

import { Logo } from '../molecules'

function PageHeader() {
  const navItems = [
    { name: 'Blog', href: PUBLIC_ROUTES.POSTS },
    { name: 'Create', href: PUBLIC_ROUTES.POSTS_CREATE },
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
                  className="hover:text-primary"
                  href={item.href}
                  key={item.name}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </nav>
    </header>
  )
}

export { PageHeader }

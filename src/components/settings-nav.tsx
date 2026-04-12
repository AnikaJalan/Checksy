'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Profile', href: '/settings/profile' },
  { name: 'Preferences', href: '/settings/preferences' },
  { name: 'API Keys', href: '/settings/keys' },
  { name: 'Templates', href: '/settings/templates' },
  { name: 'Custom Rules', href: '/settings/rules' },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-y-1 lg:space-x-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'hover:bg-muted justify-start rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

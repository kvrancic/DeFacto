'use client'

import { Home, Search, Plus, User, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  
  const items = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/submit', icon: Plus, label: 'Submit' },
    { href: '/validations', icon: FileCheck, label: 'Validate' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <nav className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "text-muted-foreground hover:text-foreground transition-colors",
                "tap-highlight-transparent",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                item.href === '/submit' && "h-6 w-6"
              )} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
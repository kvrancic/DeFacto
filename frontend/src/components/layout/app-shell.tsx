import { TopNav } from './top-nav'
import { MobileNav } from './mobile-nav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto px-4 pb-20 md:pb-8 pt-6">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
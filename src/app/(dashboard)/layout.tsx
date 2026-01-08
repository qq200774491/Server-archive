import Link from 'next/link'
import { MainNav, MobileNav } from '@/components/nav'
import { AdminLogoutButton } from '@/components/admin-logout-button'
import { requireAdminSession } from '@/lib/admin-session'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminSession()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur">
        <div className="container flex h-16 items-center gap-6">
          <Link href="/admin/overview" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-semibold">
              SA
            </span>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Server Archive</div>
              <div className="text-xs text-muted-foreground">Admin Console</div>
            </div>
          </Link>
          <div className="hidden md:flex">
            <MainNav />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle showLabel />
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8 pb-24 md:pb-8 page-fade">
        {children}
      </main>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  )
}

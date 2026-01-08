import { MainNav, MobileNav } from '@/components/nav'
import { AdminLogoutButton } from '@/components/admin-logout-button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 font-bold text-lg">
            Server Archive
          </div>
          <div className="hidden md:flex">
            <MainNav />
          </div>
          <div className="ml-auto flex items-center">
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  )
}

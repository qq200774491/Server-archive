'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Map, Users, Archive, Trophy, Home, LayoutGrid, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/admin/overview', label: '概览', icon: LayoutGrid },
  { href: '/maps', label: '地图', icon: Map },
  { href: '/players', label: '玩家', icon: Users },
  { href: '/archives', label: '存档', icon: Archive },
  { href: '/admin/leaderboard', label: '排行榜', icon: Trophy },
  { href: '/admin/settings', label: '设置', icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/80 backdrop-blur md:hidden">
      <div className="flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import type { ThemeOption } from '@/lib/theme-constants'

const THEME_LABELS: Record<ThemeOption, string> = {
  light: '日间',
  dark: '夜间',
  system: '跟随',
}

function getNextTheme(theme: ThemeOption): ThemeOption {
  if (theme === 'light') return 'dark'
  if (theme === 'dark') return 'system'
  return 'light'
}

function getThemeIcon(theme: ThemeOption) {
  if (theme === 'light') return Sun
  if (theme === 'dark') return Moon
  return Monitor
}

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme()
  const Icon = getThemeIcon(theme)
  const label = THEME_LABELS[theme]

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(getNextTheme(theme))}
      aria-label={`切换主题（当前：${label}）`}
      className="gap-2"
    >
      <Icon className="h-4 w-4" />
      {showLabel && <span className="hidden text-sm md:inline">{label}</span>}
    </Button>
  )
}

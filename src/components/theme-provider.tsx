'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  THEME_COOKIE_NAME,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type ThemeOption,
} from '@/lib/theme-constants'

type ThemeContextValue = {
  theme: ThemeOption
  resolvedTheme: 'light' | 'dark'
  setTheme: (value: ThemeOption) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getStoredTheme(): ThemeOption {
  if (typeof document === 'undefined') return 'system'
  const cookieMatch = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`)
  )
  if (cookieMatch?.[1]) {
    const value = decodeURIComponent(cookieMatch[1])
    if (THEME_OPTIONS.includes(value as ThemeOption)) return value as ThemeOption
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && THEME_OPTIONS.includes(stored as ThemeOption)) {
    return stored as ThemeOption
  }
  return 'system'
}

function applyTheme(resolved: 'light' | 'dark', preference: ThemeOption) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.setAttribute('data-theme', preference)
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeOption>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const resolve = () => (media.matches ? 'dark' : 'light')
    const resolved = theme === 'system' ? resolve() : theme

    setResolvedTheme(resolved)
    applyTheme(resolved, theme)

    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(
      theme
    )}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    if (theme !== 'system') return

    const handler = () => {
      const nextResolved = resolve()
      setResolvedTheme(nextResolved)
      applyTheme(nextResolved, theme)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

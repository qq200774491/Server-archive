import type { Metadata } from 'next'
import { Instrument_Sans, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeScript } from '@/components/theme-script'
import './globals.css'

const bodyFont = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Server Archive',
  description: '游戏存档管理系统 - 多地图、多玩家、多维度排行榜',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-body">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

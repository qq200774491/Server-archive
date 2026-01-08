'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'

export function AdminLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextPath = useMemo(
    () => searchParams.get('next') || '/admin/overview',
    [searchParams]
  )
  const error = useMemo(() => searchParams.get('error'), [searchParams])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function submit() {
    if (!username.trim() || !password) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setErrorMessage(data?.error || '登录失败，请重试')
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch {
      setErrorMessage('网络错误：登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden lg:flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary font-semibold">
            SA
          </span>
          <div>
            <div className="font-display text-xl font-semibold">Server Archive</div>
            <div className="text-xs text-muted-foreground">Admin Console</div>
          </div>
        </div>

        <div className="space-y-6">
          <Badge variant="outline" className="w-fit">安全管理入口</Badge>
          <h1 className="font-display text-4xl leading-tight">
            进入管理端，掌控地图、玩家与排行榜
          </h1>
          <p className="text-muted-foreground">
            使用账号密码登录，系统会签发安全会话并自动续航管理操作。
          </p>
          <div className="grid gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              会话级鉴权，支持密码更新与自动失效
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              管理路由与 API 均受保护
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              全新明暗主题与清晰的内容编排
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          登录后进入管理概览，可随时调整账号密码。
        </div>
      </section>

      <section className="flex flex-col justify-center p-6 lg:p-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">管理端登录</h2>
            <p className="text-sm text-muted-foreground">请输入账号与密码</p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>欢迎回来</CardTitle>
            <CardDescription>使用管理员账号继续</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error === 'invalid' && (
              <div className="text-sm text-destructive">登录状态已失效，请重新登录</div>
            )}
            {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}

            <Input
              placeholder="账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />

            <Input
              placeholder="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              className="w-full"
              disabled={!username.trim() || !password || submitting}
              onClick={submit}
            >
              {submitting ? '登录中...' : '登录'}
            </Button>

            <div className="text-xs text-muted-foreground">
              登录成功后会保存安全的会话 Cookie，仅用于管理端访问。
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

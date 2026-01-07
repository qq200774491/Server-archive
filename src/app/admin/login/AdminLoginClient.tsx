'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function setAdminTokenCookie(token: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 30
  document.cookie = `admin_token=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
}

export function AdminLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextPath = useMemo(
    () => searchParams.get('next') || '/maps',
    [searchParams]
  )
  const error = useMemo(() => searchParams.get('error'), [searchParams])

  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>管理端登录</CardTitle>
          <CardDescription>
            输入 `X-Admin-Token` 对应的 token（环境变量 `ADMIN_TOKEN`）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'invalid' && (
            <div className="text-sm text-destructive">Token 无效，请重新输入</div>
          )}

          <Input
            placeholder="ADMIN_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
          />

          <Button
            className="w-full"
            disabled={!token.trim() || submitting}
            onClick={() => {
              setSubmitting(true)
              setAdminTokenCookie(token.trim())
              router.replace(nextPath)
              router.refresh()
            }}
          >
            登录
          </Button>

          <div className="text-xs text-muted-foreground">
            注意：该 token 会以 Cookie 形式保存在浏览器中（非 httpOnly），仅建议用于内部管理环境。
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


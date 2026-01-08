'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function AdminSettingsForm({ username }: { username: string }) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextUsername, setNextUsername] = useState(username)
  const [nextPassword, setNextPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const payload: Record<string, string> = {
      currentPassword,
    }

    const trimmedUsername = nextUsername.trim()
    const trimmedPassword = nextPassword.trim()

    if (trimmedUsername && trimmedUsername !== username) {
      payload.username = trimmedUsername
    }
    if (trimmedPassword) {
      payload.password = trimmedPassword
    }

    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        router.replace('/admin/login?next=/admin/settings')
        router.refresh()
        return
      }

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || '更新失败')
        return
      }

      setCurrentPassword('')
      setNextPassword('')
      setSuccess('账号密码已更新')
      router.refresh()
    } catch {
      setError('网络错误：更新失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>账号与安全</CardTitle>
        <CardDescription>更新管理员账号或密码</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-username">账号</Label>
          <Input
            id="admin-username"
            value={nextUsername}
            onChange={(e) => setNextUsername(e.target.value)}
            placeholder="管理员账号"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-password">当前密码</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="请输入当前密码"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="next-password">新密码（可选）</Label>
          <Input
            id="next-password"
            type="password"
            value={nextPassword}
            onChange={(e) => setNextPassword(e.target.value)}
            placeholder="至少 8 位"
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
        {success && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400">{success}</div>
        )}

        <Button
          disabled={saving || !currentPassword.trim()}
          onClick={submit}
        >
          {saving ? '更新中...' : '保存修改'}
        </Button>
      </CardContent>
    </Card>
  )
}
